import { useState, useMemo } from 'react'
import { 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { cn, formatRelativeTime, formatDuration } from '../lib/utils'
import { useGitHubRepos, useGitHubWorkflowRuns } from '../hooks/useGitHub'

type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled'

const statusConfig: Record<PipelineStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  running: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100' },
  pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
  canceled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
}

export function Pipelines() {
  const [filter, setFilter] = useState<PipelineStatus | 'all'>('all')
  const [pipelineFilter, setPipelineFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  
  const { repos, loading: reposLoading, error: reposError } = useGitHubRepos()
  const { runs, loading: runsLoading, error: runsError, refetch } = useGitHubWorkflowRuns(repos, 50)

  const pipelines = useMemo(() => {
    return runs.map(run => {
      let status: PipelineStatus = 'pending'
      
      if (run.status === 'in_progress') {
        status = 'running'
      } else if (run.status === 'completed') {
        if (run.conclusion === 'success') status = 'success'
        else if (run.conclusion === 'failure') status = 'failed'
        else if (run.conclusion === 'cancelled') status = 'canceled'
      } else if (run.status === 'queued') {
        status = 'pending'
      }

      const duration = run.status === 'completed' 
        ? new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()
        : undefined

      return {
        id: run.id,
        projectName: run.repository.name,
        ref: run.head_branch,
        status,
        duration,
        createdAt: new Date(run.created_at),
        user: { name: run.actor.login },
        url: run.html_url
      }
    })
  }, [runs])

  const uniquePipelineNames = useMemo(() => {
    const names = [...new Set(pipelines.map(p => p.projectName))]
    return names.sort()
  }, [pipelines])

  const filteredPipelines = useMemo(() => {
    return pipelines.filter(p => {
      if (pipelineFilter !== 'all' && p.projectName !== pipelineFilter) return false
      if (filter !== 'all' && p.status !== filter) return false
      if (search && !p.projectName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [pipelines, pipelineFilter, filter, search])

  if (reposLoading || runsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-500">Loading pipeline data...</p>
        </div>
      </div>
    )
  }

  if (reposError || runsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load pipeline data</h2>
          <p className="text-gray-500">
            {reposError?.message || runsError?.message || 'An error occurred while fetching data from GitHub'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-gray-500">Monitor and manage CI/CD pipelines from GitHub Actions</p>
        </div>
        <button 
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Pipelines</option>
            {uniquePipelineNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PipelineStatus | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Pipeline List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Project</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Branch</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Triggered</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-gray-500">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPipelines.map((pipeline) => {
                const StatusIcon = statusConfig[pipeline.status].icon
                return (
                  <tr key={pipeline.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium",
                        statusConfig[pipeline.status].bg,
                        statusConfig[pipeline.status].color
                      )}>
                        <StatusIcon className={cn(
                          "w-4 h-4",
                          pipeline.status === 'running' && 'animate-spin'
                        )} />
                        {pipeline.status}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{pipeline.projectName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{pipeline.ref}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {pipeline.duration ? formatDuration(pipeline.duration) : '-'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatRelativeTime(pipeline.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{pipeline.user.name}</td>
                    <td className="px-5 py-4">
                      <a 
                        href={pipeline.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
