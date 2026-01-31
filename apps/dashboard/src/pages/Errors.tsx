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
  Hash,
  ExternalLink,
  BookOpen
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'

// Error catalog for lookup
const ERROR_CATALOG: Record<string, {
  code: string
  name: string
  message: string
  severity: 'critical' | 'error' | 'warning' | 'info'
  sdk: string
  component: string
  resolution: string
  docs: string
  ownership: { team: string; email: string; slack: string }
}> = {
  'AUTH-00142': {
    code: 'AUTH-00142',
    name: 'TokenRefreshError',
    message: 'OAuth token refresh failed - Entra ID returned 401 Unauthorized',
    severity: 'error',
    sdk: '@federated/auth',
    component: 'OAuthTokenManager',
    resolution: 'Check if the refresh token has expired. User may need to re-authenticate. Verify Entra ID app registration is correctly configured.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/authentication.md',
    ownership: { team: 'Platform Auth', email: 'auth-team@company.com', slack: '#auth-incidents' }
  },
  'AUTH-00098': {
    code: 'AUTH-00098',
    name: 'CacheMiss',
    message: 'Session cache miss - falling back to database lookup',
    severity: 'info',
    sdk: '@federated/auth',
    component: 'SessionManager',
    resolution: 'This is informational. If occurring frequently, consider increasing cache TTL or cache size.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/authentication.md',
    ownership: { team: 'Platform Auth', email: 'auth-team@company.com', slack: '#auth-incidents' }
  },
  'SDK-00089': {
    code: 'SDK-00089',
    name: 'RateLimitError',
    message: 'Rate limit exceeded for GitHub API - 5000 requests/hour limit reached',
    severity: 'warning',
    sdk: '@federated/facade',
    component: 'GitHubService',
    resolution: 'Implement request caching, use conditional requests with ETags, or request a higher rate limit from GitHub.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/overview.md',
    ownership: { team: 'Platform Core', email: 'core-team@company.com', slack: '#platform-incidents' }
  },
  'TEL-00023': {
    code: 'TEL-00023',
    name: 'QueueBacklogError',
    message: 'Metrics ingestion queue backlog critical - 50k events pending',
    severity: 'critical',
    sdk: '@federated/telemetry',
    component: 'MetricsIngestionService',
    resolution: 'Scale up ingestion workers, check for downstream service issues, consider dropping low-priority metrics temporarily.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/telemetry.md',
    ownership: { team: 'Observability', email: 'observability@company.com', slack: '#obs-incidents' }
  },
  'UI-00017': {
    code: 'UI-00017',
    name: 'ConfigLoadError',
    message: 'Failed to load dashboard component configuration from remote',
    severity: 'error',
    sdk: '@federated/ui-config',
    component: 'DashboardConfigLoader',
    resolution: 'Check network connectivity to config service. Verify config endpoint is responding. Fall back to cached config if available.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/ui-config.md',
    ownership: { team: 'Frontend Platform', email: 'frontend@company.com', slack: '#frontend-incidents' }
  },
  'PIPE-00034': {
    code: 'PIPE-00034',
    name: 'WorkflowTimeoutError',
    message: 'GitHub Actions workflow failed: Security scan step timed out after 30m',
    severity: 'error',
    sdk: '@federated/pipelines',
    component: 'WorkflowMonitor',
    resolution: 'Review the security scan configuration. Large codebases may need increased timeout. Check for infinite loops in scan rules.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/pipelines.md',
    ownership: { team: 'DevOps', email: 'devops@company.com', slack: '#devops-incidents' }
  },
  'SNYK-00012': {
    code: 'SNYK-00012',
    name: 'SnykConnectionError',
    message: 'Snyk API connection failed - unable to fetch vulnerability scan results',
    severity: 'warning',
    sdk: '@federated/security',
    component: 'SnykIntegration',
    resolution: 'Verify SNYK_TOKEN is valid and not expired. Check Snyk service status. Retry with exponential backoff.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/security/snyk-integration.md',
    ownership: { team: 'Security', email: 'security@company.com', slack: '#security-incidents' }
  },
  'CHAT-00005': {
    code: 'CHAT-00005',
    name: 'AIRateLimitError',
    message: 'Anthropic API rate limit - Claude responses throttled',
    severity: 'warning',
    sdk: '@federated/chat-api',
    component: 'ChatbotService',
    resolution: 'Implement request queuing, add response caching for common queries, or upgrade API tier for higher limits.',
    docs: 'https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/chat-api.md',
    ownership: { team: 'Platform Core', email: 'core-team@company.com', slack: '#platform-incidents' }
  },
}

const lookupSeverityConfig = {
  critical: { icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
  error: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' },
}

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
    message: 'OAuth token refresh failed - Entra ID returned 401 Unauthorized',
    name: 'TokenRefreshError',
    severity: 'error',
    sdkName: '@federated/auth',
    component: 'OAuthTokenManager',
    timestamp: new Date(Date.now() - 180000),
    context: {
      userId: 'user-derick-owens',
      operation: 'refreshAccessToken',
      requestId: 'req-abc123',
    },
    ownership: {
      team: 'Platform Auth',
      email: 'auth-team@company.com',
      incidentGroup: '#auth-incidents',
    },
    stack: 'TokenRefreshError: OAuth token refresh failed\n    at OAuthTokenManager.refresh (/src/auth/token-manager.ts:45)\n    at async AuthMiddleware.validateToken (/src/middleware/auth.ts:28)',
  },
  {
    id: 'err-2',
    errorId: 'SDK-00089',
    message: 'Rate limit exceeded for GitHub API - 5000 requests/hour limit reached',
    name: 'RateLimitError',
    severity: 'warning',
    sdkName: '@federated/facade',
    component: 'GitHubService',
    timestamp: new Date(Date.now() - 900000),
    context: {
      operation: 'fetchWorkflowRuns',
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
    message: 'Metrics ingestion queue backlog critical - 50k events pending',
    name: 'QueueBacklogError',
    severity: 'critical',
    sdkName: '@federated/telemetry',
    component: 'MetricsIngestionService',
    timestamp: new Date(Date.now() - 3600000),
    context: {
      operation: 'processMetricsBatch',
    },
    ownership: {
      team: 'Observability',
      email: 'observability@company.com',
      incidentGroup: '#obs-incidents',
    },
    stack: 'QueueBacklogError: Metrics ingestion queue backlog critical\n    at MetricsIngestionService.checkBacklog (/src/telemetry/ingestion.ts:78)',
  },
  {
    id: 'err-4',
    errorId: 'UI-00017',
    message: 'Failed to load dashboard component configuration from remote',
    name: 'ConfigLoadError',
    severity: 'error',
    sdkName: '@federated/ui-config',
    component: 'DashboardConfigLoader',
    timestamp: new Date(Date.now() - 7200000),
    context: {
      operation: 'loadRemoteConfig',
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
    message: 'Session cache miss - falling back to database lookup',
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
    message: 'GitHub Actions workflow failed: Security scan step timed out after 30m',
    name: 'WorkflowTimeoutError',
    severity: 'error',
    sdkName: '@federated/pipelines',
    component: 'WorkflowMonitor',
    timestamp: new Date(Date.now() - 1800000),
    context: {
      operation: 'monitorWorkflowRun',
      requestId: 'run-12345678',
    },
    ownership: {
      team: 'DevOps',
      email: 'devops@company.com',
      incidentGroup: '#devops-incidents',
    },
    stack: 'WorkflowTimeoutError: Security scan step timed out\n    at WorkflowMonitor.checkStatus (/src/pipelines/monitor.ts:156)',
  },
  {
    id: 'err-7',
    errorId: 'SNYK-00012',
    message: 'Snyk API connection failed - unable to fetch vulnerability scan results',
    name: 'SnykConnectionError',
    severity: 'warning',
    sdkName: '@federated/security',
    component: 'SnykIntegration',
    timestamp: new Date(Date.now() - 600000),
    context: {
      operation: 'fetchScanResults',
      requestId: 'snyk-scan-789',
    },
    ownership: {
      team: 'Security',
      email: 'security@company.com',
      incidentGroup: '#security-incidents',
    },
  },
  {
    id: 'err-8',
    errorId: 'CHAT-00005',
    message: 'Anthropic API rate limit - Claude responses throttled',
    name: 'AIRateLimitError',
    severity: 'warning',
    sdkName: '@federated/chat-api',
    component: 'ChatbotService',
    timestamp: new Date(Date.now() - 420000),
    context: {
      operation: 'sendChatMessage',
      userId: 'user-derick-owens',
    },
    ownership: {
      team: 'Platform Core',
      email: 'core-team@company.com',
      incidentGroup: '#platform-incidents',
    },
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
  
  // Error lookup state
  const [errorLookupSearch, setErrorLookupSearch] = useState('')
  const [foundError, setFoundError] = useState<typeof ERROR_CATALOG[string] | null>(null)
  const [errorNotFound, setErrorNotFound] = useState(false)

  const handleErrorLookup = () => {
    const searchTerm = errorLookupSearch.trim().toUpperCase()
    if (!searchTerm) {
      setFoundError(null)
      setErrorNotFound(false)
      return
    }
    
    const error = ERROR_CATALOG[searchTerm]
    if (error) {
      setFoundError(error)
      setErrorNotFound(false)
    } else {
      setFoundError(null)
      setErrorNotFound(true)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Error Triage</h1>
          <p className="text-gray-500">Look up error codes, find resolution steps, and route incidents to the right team</p>
        </div>
        <a
          href="https://github.com/derickwowens/devex-dashboard/blob/main/docs/standards/structured-logging.md"
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

      {/* Error Code Lookup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Error Code Lookup</h3>
            <p className="text-sm text-gray-500">Search for error codes to get resolution steps and team ownership</p>
          </div>
        </div>
        
        <div className="p-5">
          {/* Search Input */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter error code (e.g., AUTH-00142)"
                value={errorLookupSearch}
                onChange={(e) => setErrorLookupSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleErrorLookup()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>
            <button
              onClick={handleErrorLookup}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Lookup
            </button>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-500">Try:</span>
            {Object.keys(ERROR_CATALOG).slice(0, 5).map(code => (
              <button
                key={code}
                onClick={() => {
                  setErrorLookupSearch(code)
                  setFoundError(ERROR_CATALOG[code])
                  setErrorNotFound(false)
                }}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono hover:bg-gray-200 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>

          {/* Error Not Found */}
          {errorNotFound && (
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Error code not found</p>
              <p className="text-sm text-gray-500">Try one of the example codes above</p>
            </div>
          )}

          {/* Found Error Details */}
          {foundError && (
            <div className={cn(
              "rounded-lg border-2 overflow-hidden",
              lookupSeverityConfig[foundError.severity].border
            )}>
              {/* Header */}
              <div className={cn(
                "px-4 py-3 flex items-center justify-between",
                lookupSeverityConfig[foundError.severity].bg
              )}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = lookupSeverityConfig[foundError.severity].icon
                    return <IconComponent className={cn("w-5 h-5", lookupSeverityConfig[foundError.severity].color)} />
                  })()}
                  <div>
                    <span className="font-bold font-mono text-gray-900">{foundError.code}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="font-medium text-gray-700">{foundError.name}</span>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-bold uppercase",
                  lookupSeverityConfig[foundError.severity].bg,
                  lookupSeverityConfig[foundError.severity].color
                )}>
                  {foundError.severity}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Message */}
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Error Message</div>
                  <div className="text-gray-900">{foundError.message}</div>
                </div>

                {/* SDK & Component */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">SDK</div>
                    <div className="font-mono text-sm text-blue-600">{foundError.sdk}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Component</div>
                    <div className="font-mono text-sm text-gray-700">{foundError.component}</div>
                  </div>
                </div>

                {/* Resolution */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-700 uppercase font-semibold mb-1">Resolution Steps</div>
                  <div className="text-sm text-green-800">{foundError.resolution}</div>
                </div>

                {/* Ownership */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-700 uppercase font-semibold mb-2">Team Ownership</div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{foundError.ownership.team}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <a href={`mailto:${foundError.ownership.email}`} className="text-blue-600 hover:underline">
                        {foundError.ownership.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{foundError.ownership.slack}</span>
                    </div>
                  </div>
                </div>

                {/* Docs Link */}
                <a
                  href={foundError.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Documentation
                </a>
              </div>
            </div>
          )}
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
