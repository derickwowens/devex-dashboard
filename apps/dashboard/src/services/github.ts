const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN
const GITHUB_API_BASE = 'https://api.github.com'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  updated_at: string
  pushed_at: string
  default_branch: string
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

interface GitHubWorkflowRun {
  id: number
  name: string
  head_branch: string
  head_sha: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null
  workflow_id: number
  created_at: string
  updated_at: string
  run_started_at: string
  html_url: string
  repository: {
    name: string
    full_name: string
  }
  head_commit: {
    message: string
    author: {
      name: string
    }
  }
  actor: {
    login: string
    avatar_url: string
  }
}

interface GitHubWorkflowRunsResponse {
  total_count: number
  workflow_runs: GitHubWorkflowRun[]
}

class GitHubAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new GitHubAPIError(
      errorData.message || `GitHub API error: ${response.statusText}`,
      response.status
    )
  }

  return response.json()
}

interface GitHubSearchReposResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
}

async function fetchAuthenticatedUser(): Promise<GitHubUser> {
  return fetchGitHub<GitHubUser>('/user')
}

async function fetchReposWithUserCommits(username: string): Promise<GitHubRepo[]> {
  try {
    // Calculate date 1 year ago for search filter
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const dateFilter = oneYearAgo.toISOString().split('T')[0] // Format: YYYY-MM-DD
    
    // Search for repos where the user has authored commits in the past year
    const searchResult = await fetchGitHub<GitHubSearchReposResponse>(
      `/search/repositories?q=author:${username}+pushed:>=${dateFilter}&sort=updated&per_page=100`
    )
    return searchResult.items
  } catch (error) {
    console.error('Failed to search repos by commit author:', error)
    return []
  }
}

export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  // Fetch repos user owns or is a collaborator/member of
  const ownedRepos = await fetchGitHub<GitHubRepo[]>('/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member')
  
  // Get authenticated user info to search for repos with their commits
  try {
    const user = await fetchAuthenticatedUser()
    const commitRepos = await fetchReposWithUserCommits(user.login)
    
    // Merge and deduplicate repos by id
    const repoMap = new Map<number, GitHubRepo>()
    
    // Add owned repos first (they take priority)
    for (const repo of ownedRepos) {
      repoMap.set(repo.id, repo)
    }
    
    // Add repos where user has commits (if not already present)
    for (const repo of commitRepos) {
      if (!repoMap.has(repo.id)) {
        repoMap.set(repo.id, repo)
      }
    }
    
    // Convert back to array and sort by updated_at
    const allRepos = Array.from(repoMap.values())
    allRepos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    
    return allRepos
  } catch (error) {
    console.error('Failed to fetch repos with user commits, returning owned repos only:', error)
    return ownedRepos
  }
}

export async function fetchRepoCommits(owner: string, repo: string, perPage: number = 10): Promise<GitHubCommit[]> {
  const commits = await fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=${perPage}`)
  return commits
}

export async function fetchRepoWorkflowRuns(owner: string, repo: string, perPage: number = 10): Promise<GitHubWorkflowRun[]> {
  try {
    const data = await fetchGitHub<GitHubWorkflowRunsResponse>(`/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`)
    return data.workflow_runs
  } catch (error) {
    if (error instanceof GitHubAPIError && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function fetchAllWorkflowRuns(repos: GitHubRepo[], perRepo: number = 5): Promise<GitHubWorkflowRun[]> {
  const allRuns: GitHubWorkflowRun[] = []
  
  for (const repo of repos) {
    try {
      const runs = await fetchRepoWorkflowRuns(repo.owner.login, repo.name, perRepo)
      allRuns.push(...runs)
    } catch (error) {
      console.error(`Failed to fetch workflow runs for ${repo.full_name}:`, error)
    }
  }
  
  allRuns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  return allRuns
}

export async function fetchAllCommits(repos: GitHubRepo[], perRepo: number = 5): Promise<Array<GitHubCommit & { repo: string }>> {
  const allCommits: Array<GitHubCommit & { repo: string }> = []
  
  for (const repo of repos) {
    try {
      const commits = await fetchRepoCommits(repo.owner.login, repo.name, perRepo)
      allCommits.push(...commits.map(c => ({ ...c, repo: repo.name })))
    } catch (error) {
      console.error(`Failed to fetch commits for ${repo.full_name}:`, error)
    }
  }
  
  allCommits.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
  
  return allCommits
}

interface GitHubFileContent {
  type: string
  encoding: string
  content: string
  name: string
  path: string
}

export interface PackageJson {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

export async function fetchRepoPackageJson(owner: string, repo: string): Promise<PackageJson | null> {
  try {
    const data = await fetchGitHub<GitHubFileContent>(`/repos/${owner}/${repo}/contents/package.json`)
    if (data.encoding === 'base64' && data.content) {
      const decoded = atob(data.content.replace(/\n/g, ''))
      return JSON.parse(decoded)
    }
    return null
  } catch (error) {
    if (error instanceof GitHubAPIError && error.status === 404) {
      return null
    }
    console.error(`Failed to fetch package.json for ${owner}/${repo}:`, error)
    return null
  }
}

export async function fetchRepoEnvExample(owner: string, repo: string): Promise<string[] | null> {
  try {
    const data = await fetchGitHub<GitHubFileContent>(`/repos/${owner}/${repo}/contents/.env.example`)
    if (data.encoding === 'base64' && data.content) {
      const decoded = atob(data.content.replace(/\n/g, ''))
      // Extract environment variable names (lines that start with a variable name)
      const envVars = decoded
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0].trim())
        .filter(Boolean)
      return envVars
    }
    return null
  } catch {
    return null
  }
}

export async function fetchAllPackageJsons(repos: GitHubRepo[]): Promise<Map<string, PackageJson>> {
  const packageJsons = new Map<string, PackageJson>()
  
  for (const repo of repos) {
    try {
      const pkg = await fetchRepoPackageJson(repo.owner.login, repo.name)
      if (pkg) {
        packageJsons.set(repo.name, pkg)
      }
    } catch (error) {
      console.error(`Failed to fetch package.json for ${repo.full_name}:`, error)
    }
  }
  
  return packageJsons
}

export type { GitHubRepo, GitHubCommit, GitHubWorkflowRun }
