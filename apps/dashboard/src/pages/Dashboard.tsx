import { 
  GitBranch, 
  AlertCircle, 
  Users, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
  Rocket,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  Globe2
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'
import { useGitHubRepos, useGitHubWorkflowRuns } from '../hooks/useGitHub'
import { useMemo } from 'react'

export function Dashboard() {
  const { repos, loading: reposLoading, error: reposError } = useGitHubRepos()
  const { runs, loading: runsLoading, error: runsError } = useGitHubWorkflowRuns(repos, 10)

  const stats = useMemo(() => {
    const totalRepos = repos.length
    const recentRuns = runs.slice(0, 20)
    const completedRuns = recentRuns.filter(r => r.status === 'completed')
    const failedRuns = completedRuns.filter(r => r.conclusion === 'failure')
    const successRuns = completedRuns.filter(r => r.conclusion === 'success')
    const inProgressRuns = recentRuns.filter(r => r.status === 'in_progress')
    
    const errorRate = completedRuns.length > 0 
      ? ((failedRuns.length / completedRuns.length) * 100).toFixed(2)
      : '0.00'
    
    const avgBuildTime = completedRuns.length > 0
      ? completedRuns.reduce((acc, run) => {
          const start = new Date(run.run_started_at).getTime()
          const end = new Date(run.updated_at).getTime()
          return acc + (end - start)
        }, 0) / completedRuns.length
      : 0
    
    const formatBuildTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
    }

    return [
      { 
        name: 'Active Pipelines', 
        value: inProgressRuns.length.toString(), 
        change: `${recentRuns.length} total`, 
        trend: 'up',
        icon: GitBranch,
        color: 'text-blue-600 bg-blue-100'
      },
      { 
        name: 'Error Rate', 
        value: `${errorRate}%`, 
        change: `${failedRuns.length}/${completedRuns.length}`, 
        trend: failedRuns.length === 0 ? 'down' : 'up',
        icon: AlertCircle,
        color: 'text-red-600 bg-red-100'
      },
      { 
        name: 'Repositories', 
        value: totalRepos.toString(), 
        change: `${successRuns.length} success`, 
        trend: 'up',
        icon: Users,
        color: 'text-green-600 bg-green-100'
      },
      { 
        name: 'Avg Build Time', 
        value: formatBuildTime(avgBuildTime), 
        change: completedRuns.length > 0 ? `${completedRuns.length} runs` : 'N/A', 
        trend: 'down',
        icon: Clock,
        color: 'text-purple-600 bg-purple-100'
      },
    ]
  }, [repos, runs])

  const recentPipelines = useMemo(() => {
    return runs.slice(0, 5).map(run => {
      let status: 'success' | 'failed' | 'running' | 'pending' = 'pending'
      
      if (run.status === 'in_progress') {
        status = 'running'
      } else if (run.status === 'completed') {
        if (run.conclusion === 'success') status = 'success'
        else if (run.conclusion === 'failure') status = 'failed'
      } else if (run.status === 'queued') {
        status = 'pending'
      }

      return {
        id: run.id,
        project: run.repository.name,
        branch: run.head_branch,
        status,
        time: formatRelativeTime(new Date(run.created_at))
      }
    })
  }, [runs])

  const recentErrors = useMemo(() => {
    return runs
      .filter(run => run.status === 'completed' && run.conclusion === 'failure')
      .slice(0, 3)
      .map(run => ({
        id: run.id,
        message: `Build failed in ${run.repository.name} on ${run.head_branch}`,
        severity: 'error' as const,
        time: formatRelativeTime(new Date(run.updated_at))
      }))
  }, [runs])

  if (reposLoading || runsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-500">Loading GitHub data...</p>
        </div>
      </div>
    )
  }

  if (reposError || runsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load GitHub data</h2>
          <p className="text-gray-500">
            {reposError?.message || runsError?.message || 'An error occurred while fetching data from GitHub'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ecosystem Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-6 h-6" />
              <span className="text-indigo-200 text-sm font-medium">ECOSYSTEM PLATFORM</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Your Developer Ecosystem</h1>
            <p className="text-indigo-100 max-w-xl">
              One unified platform to reduce friction between you and your tools. 
              Auth, errors, pipelines, telemetry — all handled through a single API.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://github.com/derickwowens/devex-dashboard/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Rocket className="w-4 h-4" />
              <span>Quick Start</span>
            </a>
            <a 
              href="https://github.com/derickwowens/devex-dashboard/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </a>
          </div>
        </div>
        
        {/* Ecosystem Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3">
            <Shield className="w-5 h-5 mb-2 text-indigo-200" />
            <div className="font-medium">Centralized Auth</div>
            <div className="text-xs text-indigo-200">Entra OBO + Role Store</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 mb-2 text-indigo-200" />
            <div className="font-medium">Unified Errors</div>
            <div className="text-xs text-indigo-200">Fast triage routing</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <Zap className="w-5 h-5 mb-2 text-indigo-200" />
            <div className="font-medium">Fluent API</div>
            <div className="text-xs text-indigo-200">Chainable & discoverable</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <GitBranch className="w-5 h-5 mb-2 text-indigo-200" />
            <div className="font-medium">Pipeline Ops</div>
            <div className="text-xs text-indigo-200">CI/CD at your fingertips</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  "w-4 h-4",
                  stat.trend === 'down' && 'rotate-180'
                )} />
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pipelines */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Pipelines</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPipelines.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No active pipelines found
              </div>
            ) : (
              recentPipelines.map((pipeline) => (
                <div key={pipeline.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {pipeline.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {pipeline.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {pipeline.status === 'running' && (
                      <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                    )}
                    {pipeline.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-[200px]" title={pipeline.project}>
                        {pipeline.project}
                      </div>
                      <div className="text-sm text-gray-500 flex gap-2">
                        <span className="font-mono">{pipeline.branch}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {pipeline.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Errors</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentErrors.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">
                No recent errors
              </div>
            ) : (
              recentErrors.map((error) => (
                <div key={error.id} className="px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-orange-500" />
                      <div>
                        <div className="text-gray-900">{error.message}</div>
                        <div className="text-sm text-gray-500 capitalize">{error.severity}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">{error.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ecosystem API Quick Reference */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Ecosystem API — One Import, Everything You Need</h2>
            <p className="text-sm text-gray-500">Reduce friction with the fluent, chainable API</p>
          </div>
          <a 
            href="https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/overview.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Full API Docs
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="bg-gray-900 p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-gray-100">{`import { sdk } from '@federated/facade';

// 🔐 Authentication — No custom auth logic needed
await sdk.auth().loginWithCode(code).execute();
if (await sdk.auth().hasPermission('pipelines', 'create')) { ... }

// 🚨 Error Handling — Fast triage with ownership routing
sdk.errors()
  .capture(err)
  .withErrorId('AUTH-00142')
  .withOwnership({ team: 'Platform Auth', email: 'auth@co.com', incidentGroup: '#auth' })
  .send();

// 📊 Telemetry — Metrics without the boilerplate
sdk.telemetry().metric('api.latency').value(150).unit('ms').send();

// 🚀 Pipelines — CI/CD operations at your fingertips
sdk.pipelines().trigger('my-project', 'main').execute();`}</pre>
        </div>
      </div>

      {/* Onboarding CTA */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Rocket className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">New to the Ecosystem?</h3>
              <p className="text-emerald-100">Get up and running in under 5 minutes with our quick start guide.</p>
            </div>
          </div>
          <a 
            href="https://github.com/derickwowens/devex-dashboard/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-semibold"
          >
            Start Onboarding
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
