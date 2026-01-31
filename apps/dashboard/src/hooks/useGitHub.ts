import { useState, useEffect } from 'react'
import {
  fetchUserRepos,
  fetchAllWorkflowRuns,
  fetchAllCommits,
  type GitHubRepo,
  type GitHubWorkflowRun,
  type GitHubCommit
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
