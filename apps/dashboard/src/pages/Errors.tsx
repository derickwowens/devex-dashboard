import { useState, useMemo } from 'react'
import { 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Mail,
  Users,
  Hash
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'

type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

interface ErrorOwnership {
  team: string
  email: string
  incidentGroup: string
}

interface ErrorReport {
  id: string
  errorId: string
  message: string
  name: string
  severity: ErrorSeverity
  sdkName: string
  component?: string
  timestamp: Date
  context: {
    userId?: string
    operation?: string
    requestId?: string
  }
  ownership: ErrorOwnership
  stack?: string
}

/**
 * Format error string according to ecosystem standard:
 * [ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
 */
const formatErrorString = (error: ErrorReport): string => {
  return `${error.errorId}: ${error.message}: ${error.ownership.team}: ${error.ownership.email}: ${error.ownership.incidentGroup}`
}

const demoErrors: ErrorReport[] = [
  {
    id: 'err-1',
    errorId: 'AUTH-00142',
    message: 'Connection timeout while fetching player data',
    name: 'TimeoutError',
    severity: 'error',
    sdkName: '@federated/auth',
    component: 'PlayerService',
    timestamp: new Date(Date.now() - 180000),
    context: {
      userId: 'user-123',
      operation: 'fetchPlayerProfile',
      requestId: 'req-abc123',
    },
    ownership: {
      team: 'Platform Auth',
      email: 'auth-team@company.com',
      incidentGroup: '#auth-incidents',
    },
    stack: 'TimeoutError: Connection timeout\n    at PlayerService.fetch (/src/services/player.ts:45)\n    at async handler (/src/routes/player.ts:12)',
  },
  {
    id: 'err-2',
    errorId: 'SDK-00089',
    message: 'Rate limit exceeded for API gateway',
    name: 'RateLimitError',
    severity: 'warning',
    sdkName: '@federated/facade',
    component: 'APIGateway',
    timestamp: new Date(Date.now() - 900000),
    context: {
      operation: 'processRequest',
      requestId: 'req-def456',
    },
    ownership: {
      team: 'Platform Core',
      email: 'core-team@company.com',
      incidentGroup: '#platform-incidents',
    },
  },
  {
    id: 'err-3',
    errorId: 'TEL-00023',
    message: 'Memory threshold exceeded - 95% utilization',
    name: 'ResourceError',
    severity: 'critical',
    sdkName: '@federated/telemetry',
    component: 'GameEngine',
    timestamp: new Date(Date.now() - 3600000),
    context: {
      operation: 'renderFrame',
    },
    ownership: {
      team: 'Observability',
      email: 'observability@company.com',
      incidentGroup: '#obs-incidents',
    },
    stack: 'ResourceError: Memory threshold exceeded\n    at MemoryMonitor.check (/src/monitoring/memory.ts:78)',
  },
  {
    id: 'err-4',
    errorId: 'UI-00017',
    message: 'Failed to parse configuration file',
    name: 'ParseError',
    severity: 'error',
    sdkName: '@federated/ui-config',
    component: 'ConfigLoader',
    timestamp: new Date(Date.now() - 7200000),
    context: {
      operation: 'loadConfig',
    },
    ownership: {
      team: 'Frontend Platform',
      email: 'frontend@company.com',
      incidentGroup: '#frontend-incidents',
    },
  },
  {
    id: 'err-5',
    errorId: 'AUTH-00098',
    message: 'Cache miss for session data',
    name: 'CacheMiss',
    severity: 'info',
    sdkName: '@federated/auth',
    component: 'SessionManager',
    timestamp: new Date(Date.now() - 300000),
    context: {
      userId: 'user-456',
      operation: 'getSession',
    },
    ownership: {
      team: 'Platform Auth',
      email: 'auth-team@company.com',
      incidentGroup: '#auth-incidents',
    },
  },
  {
    id: 'err-6',
    errorId: 'PIPE-00034',
    message: 'Pipeline execution failed: build step timeout',
    name: 'PipelineError',
    severity: 'error',
    sdkName: '@federated/pipelines',
    component: 'BuildRunner',
    timestamp: new Date(Date.now() - 1800000),
    context: {
      operation: 'executePipeline',
      requestId: 'pipe-xyz789',
    },
    ownership: {
      team: 'DevOps',
      email: 'devops@company.com',
      incidentGroup: '#devops-incidents',
    },
    stack: 'PipelineError: Build step timeout\n    at BuildRunner.execute (/src/pipeline/runner.ts:156)',
  },
]

const severityConfig: Record<ErrorSeverity, { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100' },
  error: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  debug: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100' },
}

export function Errors() {
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | 'all'>('all')
  const [sdkFilter, setSdkFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const uniqueSdkNames = useMemo(() => {
    const names = [...new Set(demoErrors.map(e => e.sdkName))]
    return names.sort()
  }, [])

  const filteredErrors = demoErrors.filter(e => {
    if (sdkFilter !== 'all' && e.sdkName !== sdkFilter) return false
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false
    if (search && !e.message.toLowerCase().includes(search.toLowerCase()) && 
        !e.errorId.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    critical: demoErrors.filter(e => e.severity === 'critical').length,
    error: demoErrors.filter(e => e.severity === 'error').length,
    warning: demoErrors.filter(e => e.severity === 'warning').length,
    total: demoErrors.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Tracking</h1>
          <p className="text-gray-500">Centralized error monitoring and analysis</p>
        </div>
        <a
          href="http://localhost:8000/standards/structured-logging/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
          title="Structured Logging Standard - Error Framework Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Errors</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
          <div className="text-sm text-red-600">Critical</div>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.error}</div>
          <div className="text-sm text-orange-500">Errors</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          <div className="text-sm text-yellow-500">Warnings</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by message or error ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sdkFilter}
            onChange={(e) => setSdkFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All SDKs</option>
            {uniqueSdkNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as ErrorSeverity | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.map((error) => {
          const config = severityConfig[error.severity]
          const SeverityIcon = config.icon
          const isExpanded = expandedId === error.id

          return (
            <div 
              key={error.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div 
                className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : error.id)}
              >
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <SeverityIcon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-gray-800 text-white">
                      {error.errorId}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium uppercase",
                      config.bg, config.color
                    )}>
                      {error.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                      {error.sdkName}
                    </span>
                    {error.component && (
                      <span className="text-sm text-gray-500">{error.component}</span>
                    )}
                  </div>
                  <div className="mt-1 font-medium text-gray-900">{error.message}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {error.name} • {formatRelativeTime(error.timestamp)}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
                  {/* Ownership - Ticket Routing Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-700 uppercase font-semibold mb-2">Ticket Routing</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-500">Team</div>
                          <div className="text-sm font-medium">{error.ownership.team}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-500">Contact</div>
                          <a href={`mailto:${error.ownership.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                            {error.ownership.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-500">Incident Group</div>
                          <div className="text-sm font-medium">{error.ownership.incidentGroup}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Context */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {error.context.userId && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase">User ID</div>
                        <div className="text-sm font-mono">{error.context.userId}</div>
                      </div>
                    )}
                    {error.context.operation && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Operation</div>
                        <div className="text-sm font-mono">{error.context.operation}</div>
                      </div>
                    )}
                    {error.context.requestId && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Request ID</div>
                        <div className="text-sm font-mono">{error.context.requestId}</div>
                      </div>
                    )}
                  </div>

                  {/* Formatted Error String */}
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-2">Ecosystem Error String (Copy for Tickets)</div>
                    <div className="bg-gray-800 text-green-400 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                      {formatErrorString(error)}
                    </div>
                  </div>

                  {/* Stack Trace */}
                  {error.stack && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-2">Stack Trace</div>
                      <pre className="text-xs font-mono bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        <span className="text-green-400">{formatErrorString(error)}</span>
                        {'\n'}{error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
