import { useState, useMemo } from 'react'
import { 
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Tag,
  Zap,
  Bug,
  Bookmark,
  CheckSquare,
  Layers,
  RefreshCw,
  Settings
} from 'lucide-react'
import { cn } from '../lib/utils'

type WorkItemType = 'epic' | 'feature' | 'story' | 'task' | 'bug'
type WorkItemStatus = 'backlog' | 'ready' | 'in_progress' | 'in_review' | 'done'
type IntegrationSource = 'jira' | 'azure_devops' | 'versionone'

interface WorkItem {
  id: string
  externalId: string
  title: string
  description: string
  type: WorkItemType
  status: WorkItemStatus
  priority: 'critical' | 'high' | 'medium' | 'low'
  storyPoints?: number
  assignee: string
  reporter: string
  project: string
  sprint?: string
  labels: string[]
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  source: IntegrationSource
  externalUrl: string
  parentId?: string
  subtasks?: number
  blockedBy?: string[]
}

const typeConfig: Record<WorkItemType, { icon: typeof Zap; color: string; bg: string; label: string }> = {
  epic: { icon: Zap, color: 'text-purple-700', bg: 'bg-purple-100', label: 'Epic' },
  feature: { icon: Layers, color: 'text-green-700', bg: 'bg-green-100', label: 'Feature' },
  story: { icon: Bookmark, color: 'text-blue-700', bg: 'bg-blue-100', label: 'Story' },
  task: { icon: CheckSquare, color: 'text-gray-700', bg: 'bg-gray-100', label: 'Task' },
  bug: { icon: Bug, color: 'text-red-700', bg: 'bg-red-100', label: 'Bug' },
}

const statusConfig: Record<WorkItemStatus, { color: string; bg: string; label: string }> = {
  backlog: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Backlog' },
  ready: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Ready' },
  in_progress: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'In Progress' },
  in_review: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'In Review' },
  done: { color: 'text-green-600', bg: 'bg-green-100', label: 'Done' },
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: 'text-red-600', label: '🔴 Critical' },
  high: { color: 'text-orange-600', label: '🟠 High' },
  medium: { color: 'text-yellow-600', label: '🟡 Medium' },
  low: { color: 'text-green-600', label: '🟢 Low' },
}

const sourceConfig: Record<IntegrationSource, { name: string; color: string; bg: string }> = {
  jira: { name: 'Jira', color: 'text-blue-700', bg: 'bg-blue-50' },
  azure_devops: { name: 'Azure DevOps', color: 'text-sky-700', bg: 'bg-sky-50' },
  versionone: { name: 'VersionOne', color: 'text-indigo-700', bg: 'bg-indigo-50' },
}

// Mock work items from various integrations
const mockWorkItems: WorkItem[] = [
  // Jira items
  {
    id: '1',
    externalId: 'DEVEX-1234',
    title: 'Implement fine-grain security policy engine',
    description: 'Build the policy evaluation engine that dynamically controls SDK capabilities based on user profiles returned from Entra ID claims.',
    type: 'feature',
    status: 'in_progress',
    priority: 'high',
    storyPoints: 13,
    assignee: 'Derick Owens',
    reporter: 'Sarah Chen',
    project: 'DevEx Platform',
    sprint: 'Sprint 24',
    labels: ['security', 'sdk', 'rbac'],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-30'),
    dueDate: new Date('2026-02-07'),
    source: 'jira',
    externalUrl: 'https://company.atlassian.net/browse/DEVEX-1234',
    subtasks: 5,
  },
  {
    id: '2',
    externalId: 'DEVEX-1235',
    title: 'Add error code lookup to Error Triage page',
    description: 'Create searchable error catalog with resolution steps and team ownership information.',
    type: 'story',
    status: 'done',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Derick Owens',
    reporter: 'Mike Johnson',
    project: 'DevEx Platform',
    sprint: 'Sprint 24',
    labels: ['errors', 'ux'],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-31'),
    source: 'jira',
    externalUrl: 'https://company.atlassian.net/browse/DEVEX-1235',
  },
  {
    id: '3',
    externalId: 'DEVEX-1240',
    title: 'OAuth token refresh fails with Entra ID 401',
    description: 'Intermittent 401 errors when refreshing OAuth tokens. Appears to happen after token has been cached for extended period.',
    type: 'bug',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Derick Owens',
    reporter: 'On-Call Alert',
    project: 'DevEx Platform',
    sprint: 'Sprint 24',
    labels: ['auth', 'critical', 'production'],
    createdAt: new Date('2026-01-29'),
    updatedAt: new Date('2026-01-31'),
    source: 'jira',
    externalUrl: 'https://company.atlassian.net/browse/DEVEX-1240',
    blockedBy: ['DEVEX-1234'],
  },
  // Azure DevOps items
  {
    id: '4',
    externalId: 'ADO-5678',
    title: 'Integrate Snyk security scans into dashboard',
    description: 'Display Snyk dependency and code analysis results in the Security Scans section with severity breakdown.',
    type: 'feature',
    status: 'done',
    priority: 'high',
    storyPoints: 8,
    assignee: 'Derick Owens',
    reporter: 'Security Team',
    project: 'Platform Security',
    sprint: 'Iteration 12',
    labels: ['security', 'snyk', 'integration'],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-28'),
    source: 'azure_devops',
    externalUrl: 'https://dev.azure.com/company/Platform/_workitems/edit/5678',
  },
  {
    id: '5',
    externalId: 'ADO-5690',
    title: 'Create hierarchical security scan view',
    description: 'Refactor security scans display to show Project → Branch → Scans hierarchy to reduce UI clutter.',
    type: 'story',
    status: 'done',
    priority: 'medium',
    storyPoints: 3,
    assignee: 'Derick Owens',
    reporter: 'UX Team',
    project: 'Platform Security',
    sprint: 'Iteration 12',
    labels: ['ux', 'dashboard'],
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-30'),
    source: 'azure_devops',
    externalUrl: 'https://dev.azure.com/company/Platform/_workitems/edit/5690',
    parentId: 'ADO-5678',
  },
  {
    id: '6',
    externalId: 'ADO-5701',
    title: 'Update GitHub Actions workflow for all severity levels',
    description: 'Remove severity threshold from Snyk scans to capture all vulnerability levels including low.',
    type: 'task',
    status: 'done',
    priority: 'low',
    assignee: 'Derick Owens',
    reporter: 'Derick Owens',
    project: 'Platform Security',
    labels: ['ci-cd', 'github-actions'],
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-01-29'),
    source: 'azure_devops',
    externalUrl: 'https://dev.azure.com/company/Platform/_workitems/edit/5701',
  },
  // VersionOne items
  {
    id: '7',
    externalId: 'E-12345',
    title: 'Unified Developer Experience Platform',
    description: 'Epic for building the federated developer experience platform that aggregates GitHub, security tools, and internal systems.',
    type: 'epic',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Derick Owens',
    reporter: 'Platform Leadership',
    project: 'Enterprise DevEx',
    labels: ['strategic', 'platform'],
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2026-01-31'),
    dueDate: new Date('2026-03-31'),
    source: 'versionone',
    externalUrl: 'https://www1.v1host.com/Company/Epic.mvc/Summary?oidToken=E-12345',
    subtasks: 24,
  },
  {
    id: '8',
    externalId: 'S-45678',
    title: 'Implement fluent facade SDK pattern',
    description: 'Design and implement the chainable API pattern for all SDK modules to ensure discoverability and AI-agent friendliness.',
    type: 'story',
    status: 'done',
    priority: 'high',
    storyPoints: 8,
    assignee: 'Derick Owens',
    reporter: 'Architecture Team',
    project: 'Enterprise DevEx',
    sprint: 'PI 4 - Sprint 3',
    labels: ['sdk', 'architecture', 'api-design'],
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-15'),
    source: 'versionone',
    externalUrl: 'https://www1.v1host.com/Company/Story.mvc/Summary?oidToken=S-45678',
    parentId: 'E-12345',
  },
  {
    id: '9',
    externalId: 'S-45699',
    title: 'Add work item integration to dashboard',
    description: 'Create mock integrations for Jira, Azure DevOps, and VersionOne to display engineer work items in a unified view.',
    type: 'story',
    status: 'in_progress',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Derick Owens',
    reporter: 'Product Owner',
    project: 'Enterprise DevEx',
    sprint: 'PI 4 - Sprint 4',
    labels: ['integration', 'dashboard'],
    createdAt: new Date('2026-01-31'),
    updatedAt: new Date('2026-01-31'),
    source: 'versionone',
    externalUrl: 'https://www1.v1host.com/Company/Story.mvc/Summary?oidToken=S-45699',
    parentId: 'E-12345',
  },
  {
    id: '10',
    externalId: 'DEVEX-1250',
    title: 'Document structured error handling standard',
    description: 'Create documentation for the error string format: [ErrorCode]: [Message]: [Team]: [Email]: [Channel]',
    type: 'task',
    status: 'ready',
    priority: 'medium',
    assignee: 'Derick Owens',
    reporter: 'Tech Lead',
    project: 'DevEx Platform',
    labels: ['documentation', 'standards'],
    createdAt: new Date('2026-01-30'),
    updatedAt: new Date('2026-01-30'),
    source: 'jira',
    externalUrl: 'https://company.atlassian.net/browse/DEVEX-1250',
  },
]

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function WorkItems() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<WorkItemType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WorkItemStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<IntegrationSource | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredItems = useMemo(() => {
    return mockWorkItems.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.externalId.toLowerCase().includes(searchLower) ||
          item.labels.some(l => l.toLowerCase().includes(searchLower))
        )
      }
      return true
    })
  }, [search, typeFilter, statusFilter, sourceFilter])

  const stats = useMemo(() => ({
    total: mockWorkItems.length,
    inProgress: mockWorkItems.filter(i => i.status === 'in_progress').length,
    inReview: mockWorkItems.filter(i => i.status === 'in_review').length,
    done: mockWorkItems.filter(i => i.status === 'done').length,
    totalPoints: mockWorkItems.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
  }), [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Work Items</h1>
          <p className="text-gray-500">Features, stories, and tasks from your connected work management tools</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors",
              isRefreshing && "opacity-50 pointer-events-none"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Sync
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            Integrations
          </button>
        </div>
      </div>

      {/* Connected Sources */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(sourceConfig).map(([key, config]) => (
          <div 
            key={key}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              config.bg, config.color
            )}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {config.name}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-yellow-600">In Progress</div>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.inReview}</div>
          <div className="text-sm text-purple-600">In Review</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-green-600">Done</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
          <div className="text-sm text-blue-600">Story Points</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, ID, or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as WorkItemType | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorkItemStatus | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as IntegrationSource | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Sources</option>
            {Object.entries(sourceConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Items List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No work items found matching your filters
          </div>
        ) : (
          filteredItems.map((item) => {
            const TypeIcon = typeConfig[item.type].icon
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id} className="hover:bg-gray-50 transition-colors">
                {/* Main Row */}
                <div 
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <button className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Type Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    typeConfig[item.type].bg
                  )}>
                    <TypeIcon className={cn("w-4 h-4", typeConfig[item.type].color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-mono px-1.5 py-0.5 rounded",
                        sourceConfig[item.source].bg,
                        sourceConfig[item.source].color
                      )}>
                        {item.externalId}
                      </span>
                      <span className="font-medium text-gray-900 truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{item.project}</span>
                      {item.sprint && (
                        <>
                          <span>•</span>
                          <span>{item.sprint}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Story Points */}
                  {item.storyPoints && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      {item.storyPoints}
                    </div>
                  )}

                  {/* Status */}
                  <span className={cn(
                    "flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium",
                    statusConfig[item.status].bg,
                    statusConfig[item.status].color
                  )}>
                    {statusConfig[item.status].label}
                  </span>

                  {/* Priority */}
                  <span className={cn("flex-shrink-0 text-sm", priorityConfig[item.priority].color)}>
                    {priorityConfig[item.priority].label}
                  </span>

                  {/* External Link */}
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pl-16 space-y-4">
                    {/* Description */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</div>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> Assignee
                        </div>
                        <div className="text-gray-700">{item.assignee}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> Reporter
                        </div>
                        <div className="text-gray-700">{item.reporter}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Updated
                        </div>
                        <div className="text-gray-700">{formatRelativeDate(item.updatedAt)}</div>
                      </div>
                      {item.dueDate && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due Date
                          </div>
                          <div className="text-gray-700">{item.dueDate.toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>

                    {/* Labels */}
                    {item.labels.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Labels
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.labels.map(label => (
                            <span 
                              key={label}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blocked By */}
                    {item.blockedBy && item.blockedBy.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-xs text-red-600 uppercase font-semibold mb-1">⚠️ Blocked By</div>
                        <div className="flex flex-wrap gap-2">
                          {item.blockedBy.map(id => (
                            <span key={id} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-mono">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subtasks */}
                    {item.subtasks && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{item.subtasks}</span> subtasks
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in {sourceConfig[item.source].name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
