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
  ExternalLink,
  ChevronDown,
  ChevronRight,
  GitCommit,
  Timer,
  FileCode,
  Hash,
  Play
} from 'lucide-react'
import { cn, formatRelativeTime, formatDuration } from '../lib/utils'
import { useGitHubRepos, useGitHubWorkflowRuns } from '../hooks/useGitHub'

type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled'

const statusConfig: Record<PipelineStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
  running: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Running' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  canceled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Canceled' },
}

export function Pipelines() {
  const [filter, setFilter] = useState<PipelineStatus | 'all'>('all')
  const [pipelineFilter, setPipelineFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
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
        workflowName: run.name,
        projectName: run.repository.name,
        fullRepoName: run.repository.full_name,
        ref: run.head_branch,
        headSha: run.head_sha,
        status,
        conclusion: run.conclusion,
        duration,
        createdAt: new Date(run.created_at),
        startedAt: run.run_started_at ? new Date(run.run_started_at) : null,
        updatedAt: new Date(run.updated_at),
        user: { 
          name: run.actor.login,
          avatar: run.actor.avatar_url
        },
        commitMessage: run.head_commit?.message || 'No commit message',
        commitAuthor: run.head_commit?.author?.name || run.actor.login,
        workflowId: run.workflow_id,
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
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 w-10"></th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Workflow</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Triggered</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPipelines.map((pipeline) => {
                const StatusIcon = statusConfig[pipeline.status].icon
                const isExpanded = expandedId === pipeline.id
                return (
                  <>
                    <tr 
                      key={pipeline.id} 
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer transition-colors",
                        isExpanded && "bg-blue-50/50"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : pipeline.id)}
                    >
                      <td className="px-3 py-4">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium",
                          statusConfig[pipeline.status].bg,
                          statusConfig[pipeline.status].color
                        )}>
                          <StatusIcon className={cn(
                            "w-4 h-4",
                            pipeline.status === 'running' && 'animate-spin'
                          )} />
                          {statusConfig[pipeline.status].label}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{pipeline.workflowName}</span>
                          <span className="text-xs text-gray-500">{pipeline.projectName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{pipeline.ref}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {pipeline.duration ? formatDuration(pipeline.duration) : '-'}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {formatRelativeTime(pipeline.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={pipeline.user.avatar} 
                            alt={pipeline.user.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-gray-600">{pipeline.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <a 
                          href={pipeline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr key={`${pipeline.id}-details`} className="bg-gray-50/80">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="ml-8 space-y-4">
                            {/* Pipeline Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Workflow Info */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Play className="w-4 h-4 text-purple-600" />
                                  <h4 className="font-medium text-gray-900">Workflow</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="text-gray-900 font-medium">{pipeline.workflowName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">ID</span>
                                    <span className="text-gray-600 font-mono text-xs">{pipeline.workflowId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Run ID</span>
                                    <span className="text-gray-600 font-mono text-xs">{pipeline.id}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Commit Info */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <GitCommit className="w-4 h-4 text-orange-600" />
                                  <h4 className="font-medium text-gray-900">Commit</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-500 block text-xs mb-1">Message</span>
                                    <span className="text-gray-900 line-clamp-2">{pipeline.commitMessage.split('\n')[0]}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">SHA</span>
                                    <span className="text-gray-600 font-mono text-xs">{pipeline.headSha.substring(0, 7)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Author</span>
                                    <span className="text-gray-600">{pipeline.commitAuthor}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Timing Info */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Timer className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-medium text-gray-900">Timing</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Created</span>
                                    <span className="text-gray-600">{pipeline.createdAt.toLocaleString()}</span>
                                  </div>
                                  {pipeline.startedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Started</span>
                                      <span className="text-gray-600">{pipeline.startedAt.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="text-gray-900 font-medium">
                                      {pipeline.duration ? formatDuration(pipeline.duration) : 'In progress...'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Repository Info */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileCode className="w-4 h-4 text-green-600" />
                                  <h4 className="font-medium text-gray-900">Repository</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="text-gray-900 font-medium">{pipeline.projectName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Branch</span>
                                    <span className="text-gray-600">{pipeline.ref}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Conclusion</span>
                                    <span className={cn(
                                      "font-medium",
                                      pipeline.conclusion === 'success' && "text-green-600",
                                      pipeline.conclusion === 'failure' && "text-red-600",
                                      !pipeline.conclusion && "text-gray-400"
                                    )}>
                                      {pipeline.conclusion || 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              <a
                                href={pipeline.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                                View on GitHub
                              </a>
                              <a
                                href={`https://github.com/${pipeline.fullRepoName}/commit/${pipeline.headSha}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Hash className="w-4 h-4" />
                                View Commit
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredPipelines.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No pipelines found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
