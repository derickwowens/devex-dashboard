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

export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  const repos = await fetchGitHub<GitHubRepo[]>('/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member')
  return repos
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

export type { GitHubRepo, GitHubCommit, GitHubWorkflowRun }
