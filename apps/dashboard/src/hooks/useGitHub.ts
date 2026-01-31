import { useState, useEffect } from 'react'
import {
  fetchUserRepos,
  fetchAllWorkflowRuns,
  fetchAllCommits,
  fetchAllPackageJsons,
  fetchRepoEnvExample,
  type GitHubRepo,
  type GitHubWorkflowRun,
  type GitHubCommit,
  type PackageJson
} from '../services/github'

interface UseGitHubReposResult {
  repos: GitHubRepo[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useGitHubRepos(): UseGitHubReposResult {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadRepos() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUserRepos()
        if (!cancelled) {
          setRepos(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch repositories'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRepos()

    return () => {
      cancelled = true
    }
  }, [refetchTrigger])

  const refetch = () => setRefetchTrigger(prev => prev + 1)

  return { repos, loading, error, refetch }
}

interface UseGitHubWorkflowRunsResult {
  runs: GitHubWorkflowRun[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useGitHubWorkflowRuns(repos: GitHubRepo[], perRepo: number = 5): UseGitHubWorkflowRunsResult {
  const [runs, setRuns] = useState<GitHubWorkflowRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadRuns() {
      if (repos.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await fetchAllWorkflowRuns(repos, perRepo)
        if (!cancelled) {
          setRuns(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch workflow runs'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRuns()

    return () => {
      cancelled = true
    }
  }, [repos, perRepo, refetchTrigger])

  const refetch = () => setRefetchTrigger(prev => prev + 1)

  return { runs, loading, error, refetch }
}

interface UseGitHubCommitsResult {
  commits: Array<GitHubCommit & { repo: string }>
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useGitHubCommits(repos: GitHubRepo[], perRepo: number = 5): UseGitHubCommitsResult {
  const [commits, setCommits] = useState<Array<GitHubCommit & { repo: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadCommits() {
      if (repos.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await fetchAllCommits(repos, perRepo)
        if (!cancelled) {
          setCommits(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch commits'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCommits()

    return () => {
      cancelled = true
    }
  }, [repos, perRepo, refetchTrigger])

  const refetch = () => setRefetchTrigger(prev => prev + 1)

  return { commits, loading, error, refetch }
}

interface UseGitHubPackageJsonsResult {
  packageJsons: Map<string, PackageJson>
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useGitHubPackageJsons(repos: GitHubRepo[]): UseGitHubPackageJsonsResult {
  const [packageJsons, setPackageJsons] = useState<Map<string, PackageJson>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadPackageJsons() {
      if (repos.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await fetchAllPackageJsons(repos)
        if (!cancelled) {
          setPackageJsons(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch package.json files'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPackageJsons()

    return () => {
      cancelled = true
    }
  }, [repos, refetchTrigger])

  const refetch = () => setRefetchTrigger(prev => prev + 1)

  return { packageJsons, loading, error, refetch }
}

interface UseGitHubEnvVarsResult {
  envVars: Map<string, string[]>
  loading: boolean
}

export function useGitHubEnvVars(repos: GitHubRepo[]): UseGitHubEnvVarsResult {
  const [envVars, setEnvVars] = useState<Map<string, string[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadEnvVars() {
      if (repos.length === 0) {
        setLoading(false)
        return
      }

      const envMap = new Map<string, string[]>()
      
      for (const repo of repos) {
        try {
          const vars = await fetchRepoEnvExample(repo.owner.login, repo.name)
          if (vars && !cancelled) {
            envMap.set(repo.name, vars)
          }
        } catch {
          // Ignore errors for individual repos
        }
      }

      if (!cancelled) {
        setEnvVars(envMap)
        setLoading(false)
      }
    }

    loadEnvVars()

    return () => {
      cancelled = true
    }
  }, [repos])

  return { envVars, loading }
}
