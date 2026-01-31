import { useState } from 'react'
import { 
  FileText, 
  Search, 
  ExternalLink,
  BookOpen,
  Code2,
  Lightbulb,
  FileCode,
  ScrollText,
  Clock,
  Tag,
  Link2,
  Filter
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'

type DocumentType = 
  | 'api-reference'
  | 'guide'
  | 'tutorial'
  | 'architecture'
  | 'adr'
  | 'runbook'
  | 'changelog'
  | 'readme'

interface Document {
  id: string
  name: string
  title: string
  description?: string
  url: string
  type: DocumentType
  projectId?: string
  packageName?: string
  teamName?: string
  version?: string
  tags: string[]
  updatedAt: Date
  status: 'draft' | 'published' | 'archived'
}

// MkDocs site base URL - update this when deployed
const MKDOCS_BASE_URL = 'http://localhost:8000'

const demoDocuments: Document[] = [
  {
    id: 'doc-auth-guide',
    name: 'authentication-guide',
    title: 'Authentication Guide',
    description: 'Complete guide to implementing authentication with Microsoft Entra OBO flow',
    url: `${MKDOCS_BASE_URL}/sdk/authentication/`,
    type: 'guide',
    packageName: '@federated/auth',
    teamName: 'Platform Auth',
    version: '1.0.0',
    tags: ['auth', 'entra', 'obo', 'security'],
    updatedAt: new Date(Date.now() - 86400000),
    status: 'published',
  },
  {
    id: 'doc-error-handling',
    name: 'error-handling-reference',
    title: 'Error Handling API Reference',
    description: 'API reference for the centralized error handling SDK',
    url: `${MKDOCS_BASE_URL}/sdk/error-handling/`,
    type: 'api-reference',
    packageName: '@federated/error-handling',
    teamName: 'Platform Core',
    version: '1.0.0',
    tags: ['errors', 'api', 'reference'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-structured-logging',
    name: 'structured-logging',
    title: 'Structured Logging Standard',
    description: 'Ecosystem standard for error IDs, ownership metadata, and ticket routing. Required reading for all SDK contributors.',
    url: `${MKDOCS_BASE_URL}/standards/structured-logging/`,
    type: 'guide',
    packageName: '@federated/error-handling',
    teamName: 'Platform Core',
    version: '1.0.0',
    tags: ['errors', 'logging', 'standards', 'tickets', 'ownership'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-getting-started',
    name: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guide to the Ecosystem Developer Platform',
    url: `${MKDOCS_BASE_URL}/getting-started/quick-start/`,
    type: 'tutorial',
    teamName: 'Platform Core',
    tags: ['quickstart', 'tutorial', 'beginner'],
    updatedAt: new Date(Date.now() - 86400000),
    status: 'published',
  },
  {
    id: 'doc-installation',
    name: 'installation',
    title: 'Installation Guide',
    description: 'How to install the Ecosystem SDK and its packages',
    url: `${MKDOCS_BASE_URL}/getting-started/installation/`,
    type: 'tutorial',
    teamName: 'Platform Core',
    tags: ['installation', 'setup', 'npm'],
    updatedAt: new Date(Date.now() - 86400000),
    status: 'published',
  },
  {
    id: 'doc-sdk-overview',
    name: 'sdk-overview',
    title: 'SDK Overview',
    description: 'Complete overview of the Federated SDK architecture and packages',
    url: `${MKDOCS_BASE_URL}/sdk/overview/`,
    type: 'api-reference',
    packageName: '@federated/facade',
    teamName: 'Platform Core',
    tags: ['sdk', 'overview', 'architecture'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-architecture',
    name: 'architecture-patterns',
    title: 'Architecture Patterns',
    description: 'Recommended architecture patterns for the platform',
    url: `${MKDOCS_BASE_URL}/architecture/patterns/`,
    type: 'architecture',
    teamName: 'Platform Core',
    tags: ['architecture', 'patterns', 'design'],
    updatedAt: new Date(Date.now() - 604800000),
    status: 'published',
  },
  {
    id: 'doc-infrastructure',
    name: 'infrastructure-patterns',
    title: 'Infrastructure Patterns',
    description: 'AWS infrastructure patterns and best practices',
    url: `${MKDOCS_BASE_URL}/architecture/infrastructure/`,
    type: 'architecture',
    teamName: 'DevOps',
    tags: ['infrastructure', 'aws', 'cloud', 'patterns'],
    updatedAt: new Date(Date.now() - 604800000),
    status: 'published',
  },
  {
    id: 'doc-adrs',
    name: 'architecture-decision-records',
    title: 'Architecture Decision Records',
    description: 'ADRs documenting key architectural decisions for the platform',
    url: `${MKDOCS_BASE_URL}/architecture/adrs/`,
    type: 'adr',
    teamName: 'Platform Core',
    tags: ['adr', 'architecture', 'decisions'],
    updatedAt: new Date(Date.now() - 604800000),
    status: 'published',
  },
  {
    id: 'doc-telemetry-guide',
    name: 'telemetry-integration',
    title: 'Telemetry Integration Guide',
    description: 'How to integrate telemetry into your services',
    url: `${MKDOCS_BASE_URL}/sdk/telemetry/`,
    type: 'guide',
    packageName: '@federated/telemetry',
    teamName: 'Observability',
    version: '1.0.0',
    tags: ['telemetry', 'metrics', 'tracing', 'observability'],
    updatedAt: new Date(Date.now() - 86400000),
    status: 'published',
  },
  {
    id: 'doc-ui-config',
    name: 'ui-configuration',
    title: 'UI Configuration Reference',
    description: 'Reference for the centralized UI configuration system',
    url: `${MKDOCS_BASE_URL}/sdk/ui-config/`,
    type: 'api-reference',
    packageName: '@federated/ui-config',
    teamName: 'Frontend Platform',
    version: '1.0.0',
    tags: ['ui', 'components', 'design-system', 'configuration'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-code-style',
    name: 'code-style',
    title: 'Code Style Guide',
    description: 'Standard code style and conventions for the Ecosystem platform',
    url: `${MKDOCS_BASE_URL}/standards/code-style/`,
    type: 'guide',
    teamName: 'Platform Core',
    tags: ['code-style', 'standards', 'conventions', 'typescript'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-facade-api',
    name: 'facade-api',
    title: 'Facade API Reference',
    description: 'Complete API reference for the main SDK entry point',
    url: `${MKDOCS_BASE_URL}/api/facade/`,
    type: 'api-reference',
    packageName: '@federated/facade',
    teamName: 'Platform Core',
    tags: ['api', 'facade', 'reference'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-errors-api',
    name: 'errors-api',
    title: 'Error API Reference',
    description: 'Complete API reference for sdk.errors()',
    url: `${MKDOCS_BASE_URL}/api/errors/`,
    type: 'api-reference',
    packageName: '@federated/error-handling',
    teamName: 'Platform Core',
    tags: ['api', 'errors', 'reference'],
    updatedAt: new Date(),
    status: 'published',
  },
  {
    id: 'doc-auth-api',
    name: 'auth-api',
    title: 'Auth API Reference',
    description: 'Complete API reference for sdk.auth()',
    url: `${MKDOCS_BASE_URL}/api/auth/`,
    type: 'api-reference',
    packageName: '@federated/auth',
    teamName: 'Platform Auth',
    tags: ['api', 'auth', 'reference'],
    updatedAt: new Date(),
    status: 'published',
  },
]

const typeConfig: Record<DocumentType, { icon: typeof FileText; label: string; color: string; bg: string }> = {
  'api-reference': { icon: Code2, label: 'API Reference', color: 'text-blue-600', bg: 'bg-blue-100' },
  'guide': { icon: BookOpen, label: 'Guide', color: 'text-green-600', bg: 'bg-green-100' },
  'tutorial': { icon: Lightbulb, label: 'Tutorial', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  'architecture': { icon: FileCode, label: 'Architecture', color: 'text-purple-600', bg: 'bg-purple-100' },
  'adr': { icon: ScrollText, label: 'ADR', color: 'text-orange-600', bg: 'bg-orange-100' },
  'runbook': { icon: FileText, label: 'Runbook', color: 'text-red-600', bg: 'bg-red-100' },
  'changelog': { icon: Clock, label: 'Changelog', color: 'text-gray-600', bg: 'bg-gray-100' },
  'readme': { icon: FileText, label: 'README', color: 'text-gray-600', bg: 'bg-gray-100' },
}

export function Documentation() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [sdkFilter, setSdkFilter] = useState<string>('all')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  // Get unique SDK names and team names for filters
  const uniqueSdks = [...new Set(demoDocuments.map(d => d.packageName).filter(Boolean))] as string[]
  const uniqueTeams = [...new Set(demoDocuments.map(d => d.teamName).filter(Boolean))] as string[]

  const filteredDocs = demoDocuments.filter(doc => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false
    if (sdkFilter !== 'all' && doc.packageName !== sdkFilter) return false
    if (teamFilter !== 'all' && doc.teamName !== teamFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description?.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q)) ||
        doc.packageName?.toLowerCase().includes(q) ||
        doc.teamName?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    total: demoDocuments.length,
    guides: demoDocuments.filter(d => d.type === 'guide').length,
    apiRefs: demoDocuments.filter(d => d.type === 'api-reference').length,
    runbooks: demoDocuments.filter(d => d.type === 'runbook').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
          <p className="text-gray-500">Federated documentation across all projects</p>
        </div>
        <a 
          href="/docs" 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Full Docs
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Documents</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700">{stats.guides}</div>
          <div className="text-sm text-green-600">Guides</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.apiRefs}</div>
          <div className="text-sm text-blue-600">API References</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="text-2xl font-bold text-red-700">{stats.runbooks}</div>
          <div className="text-sm text-red-600">Runbooks</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'all')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="guide">Guides</option>
            <option value="api-reference">API Reference</option>
            <option value="tutorial">Tutorials</option>
            <option value="architecture">Architecture</option>
            <option value="adr">ADRs</option>
            <option value="runbook">Runbooks</option>
          </select>
          <select
            value={sdkFilter}
            onChange={(e) => setSdkFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All SDKs</option>
            {uniqueSdks.map(sdk => (
              <option key={sdk} value={sdk}>{sdk}</option>
            ))}
          </select>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Teams</option>
            {uniqueTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const config = typeConfig[doc.type]
          const Icon = config.icon
          
          return (
            <div
              key={doc.id}
              className={cn(
                "bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer",
                selectedDoc?.id === doc.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      config.bg, config.color
                    )}>
                      {config.label}
                    </span>
                    {doc.packageName && (
                      <span className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                        {doc.packageName}
                      </span>
                    )}
                    {doc.teamName && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {doc.teamName}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                  {doc.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(doc.updatedAt)}
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {doc.tags.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Expanded Details */}
              {selectedDoc?.id === doc.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {doc.projectId && (
                      <div>
                        <div className="text-gray-500 text-xs uppercase mb-1">Project</div>
                        <div className="font-medium">{doc.projectId}</div>
                      </div>
                    )}
                    {doc.version && (
                      <div>
                        <div className="text-gray-500 text-xs uppercase mb-1">Version</div>
                        <div className="font-mono">{doc.version}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500 text-xs uppercase mb-1">Status</div>
                      <div className="capitalize">{doc.status}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase mb-1">Document ID</div>
                      <div className="font-mono text-xs">{doc.id}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-gray-500 text-xs uppercase mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Linked to 2 pipelines, 1 package
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Documentation as Code Info */}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Documentation as Code</h2>
        <p className="text-blue-100 mb-4">
          All documentation is version-controlled and automatically updated when code changes.
          Documents are linked to builds, pipelines, and packages for full traceability.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">Auto-Generated</div>
            <div className="text-blue-100">API docs from TypeScript</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">Build-Linked</div>
            <div className="text-blue-100">Docs update with pipelines</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">Searchable</div>
            <div className="text-blue-100">Full-text search across all docs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
