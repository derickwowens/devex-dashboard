import { useState, useEffect, useMemo } from 'react'
import { 
  FolderGit2, 
  Package, 
  TestTube2, 
  Hammer, 
  Shield, 
  Globe,
  Database,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  FileJson,
  Code2,
  Layers,
  Gauge,
  Lock,
  Cloud
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'
import { useGitHubRepos } from '../hooks/useGitHub'

interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'development'
  category: DependencyCategory
}

type DependencyCategory = 
  | 'framework' 
  | 'testing' 
  | 'build' 
  | 'linting' 
  | 'database' 
  | 'auth' 
  | 'ui' 
  | 'api' 
  | 'utility' 
  | 'monitoring'
  | 'security'
  | 'other'

interface ProjectMetadata {
  id: string
  name: string
  fullName: string
  description: string | null
  language: string | null
  languages: Record<string, number>
  defaultBranch: string
  url: string
  updatedAt: Date
  
  // Dependency analysis
  packageManager: 'npm' | 'pip' | 'cargo' | 'go' | 'maven' | 'unknown'
  dependencies: DependencyInfo[]
  
  // Categorized info
  framework: string | null
  testingInfo: {
    framework: string | null
    tools: string[]
    hasCoverage: boolean
  }
  buildInfo: {
    tool: string | null
    bundler: string | null
    transpiler: string | null
  }
  lintingInfo: {
    tools: string[]
    formatter: string | null
  }
  securityInfo: {
    authLibrary: string | null
    hasSecurityScanning: boolean
    tools: string[]
  }
  infraInfo: {
    containerized: boolean
    cloudProvider: string | null
    cicd: string | null
  }
}

const categoryConfig: Record<DependencyCategory, { icon: typeof Package; color: string; bg: string; label: string }> = {
  framework: { icon: Layers, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Framework' },
  testing: { icon: TestTube2, color: 'text-green-600', bg: 'bg-green-100', label: 'Testing' },
  build: { icon: Hammer, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Build Tools' },
  linting: { icon: Code2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Linting' },
  database: { icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'Database' },
  auth: { icon: Lock, color: 'text-red-600', bg: 'bg-red-100', label: 'Auth' },
  ui: { icon: Globe, color: 'text-pink-600', bg: 'bg-pink-100', label: 'UI' },
  api: { icon: Cloud, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'API' },
  utility: { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Utility' },
  monitoring: { icon: Gauge, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Monitoring' },
  security: { icon: Shield, color: 'text-red-700', bg: 'bg-red-100', label: 'Security' },
  other: { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Other' },
}

// Dependency categorization rules
const categorizeDependency = (name: string): DependencyCategory => {
  const lowerName = name.toLowerCase()
  
  // Testing
  if (/jest|mocha|chai|pytest|unittest|vitest|cypress|playwright|testing-library|enzyme|supertest|ava|tap|nyc|coverage|istanbul/.test(lowerName)) {
    return 'testing'
  }
  
  // Frameworks
  if (/^(react|vue|angular|svelte|next|nuxt|gatsby|express|fastify|koa|hapi|django|flask|fastapi|spring|rails)/.test(lowerName)) {
    return 'framework'
  }
  
  // Build tools
  if (/webpack|vite|rollup|parcel|esbuild|babel|tsc|typescript|swc|turbo|nx/.test(lowerName)) {
    return 'build'
  }
  
  // Linting
  if (/eslint|prettier|stylelint|tslint|pylint|flake8|black|ruff|biome/.test(lowerName)) {
    return 'linting'
  }
  
  // Database
  if (/prisma|mongoose|sequelize|typeorm|knex|postgres|mysql|redis|mongodb|sqlite|drizzle/.test(lowerName)) {
    return 'database'
  }
  
  // Auth
  if (/passport|jwt|oauth|auth0|clerk|next-auth|lucia|bcrypt|argon/.test(lowerName)) {
    return 'auth'
  }
  
  // UI
  if (/tailwind|styled-components|emotion|sass|less|postcss|radix|shadcn|mui|chakra|antd|bootstrap/.test(lowerName)) {
    return 'ui'
  }
  
  // API
  if (/axios|fetch|graphql|apollo|trpc|swr|react-query|tanstack/.test(lowerName)) {
    return 'api'
  }
  
  // Monitoring
  if (/sentry|datadog|newrelic|prometheus|grafana|winston|pino|bunyan|morgan/.test(lowerName)) {
    return 'monitoring'
  }
  
  // Security
  if (/helmet|cors|csurf|rate-limit|snyk|npm-audit|dependabot/.test(lowerName)) {
    return 'security'
  }
  
  return 'other'
}

// Mock function to analyze project - in production this would fetch actual package.json etc.
const analyzeProject = (repo: any): ProjectMetadata => {
  // Simulated dependency analysis based on repo characteristics
  const name = repo.name.toLowerCase()
  const language = repo.language?.toLowerCase() || ''
  
  // Determine package manager
  let packageManager: ProjectMetadata['packageManager'] = 'unknown'
  if (language === 'javascript' || language === 'typescript') packageManager = 'npm'
  else if (language === 'python') packageManager = 'pip'
  else if (language === 'rust') packageManager = 'cargo'
  else if (language === 'go') packageManager = 'go'
  else if (language === 'java' || language === 'kotlin') packageManager = 'maven'
  
  // Generate mock dependencies based on language and project name
  const dependencies: DependencyInfo[] = []
  
  if (packageManager === 'npm') {
    // Common JS/TS dependencies
    dependencies.push(
      { name: 'typescript', version: '^5.3.0', type: 'development', category: 'build' },
    )
    
    if (name.includes('dashboard') || name.includes('web') || name.includes('app')) {
      dependencies.push(
        { name: 'react', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'react-dom', version: '^18.2.0', type: 'production', category: 'framework' },
        { name: 'vite', version: '^5.0.0', type: 'development', category: 'build' },
        { name: 'tailwindcss', version: '^3.4.0', type: 'development', category: 'ui' },
        { name: 'lucide-react', version: '^0.303.0', type: 'production', category: 'ui' },
        { name: 'vitest', version: '^1.0.0', type: 'development', category: 'testing' },
        { name: '@testing-library/react', version: '^14.0.0', type: 'development', category: 'testing' },
        { name: 'eslint', version: '^8.56.0', type: 'development', category: 'linting' },
        { name: 'prettier', version: '^3.1.0', type: 'development', category: 'linting' },
      )
    }
    
    if (name.includes('api') || name.includes('server') || name.includes('backend')) {
      dependencies.push(
        { name: 'express', version: '^4.18.0', type: 'production', category: 'framework' },
        { name: 'cors', version: '^2.8.5', type: 'production', category: 'security' },
        { name: 'helmet', version: '^7.1.0', type: 'production', category: 'security' },
        { name: 'prisma', version: '^5.7.0', type: 'production', category: 'database' },
        { name: 'jest', version: '^29.7.0', type: 'development', category: 'testing' },
        { name: 'supertest', version: '^6.3.0', type: 'development', category: 'testing' },
        { name: 'winston', version: '^3.11.0', type: 'production', category: 'monitoring' },
        { name: 'jsonwebtoken', version: '^9.0.0', type: 'production', category: 'auth' },
      )
    }
    
    if (name.includes('sdk') || name.includes('lib') || name.includes('package')) {
      dependencies.push(
        { name: 'tsup', version: '^8.0.0', type: 'development', category: 'build' },
        { name: 'vitest', version: '^1.0.0', type: 'development', category: 'testing' },
        { name: 'typedoc', version: '^0.25.0', type: 'development', category: 'build' },
      )
    }
  }
  
  if (packageManager === 'pip') {
    dependencies.push(
      { name: 'pytest', version: '>=7.4.0', type: 'development', category: 'testing' },
      { name: 'pytest-cov', version: '>=4.1.0', type: 'development', category: 'testing' },
      { name: 'black', version: '>=23.0.0', type: 'development', category: 'linting' },
      { name: 'ruff', version: '>=0.1.0', type: 'development', category: 'linting' },
      { name: 'mypy', version: '>=1.7.0', type: 'development', category: 'linting' },
    )
    
    if (name.includes('api') || name.includes('web')) {
      dependencies.push(
        { name: 'fastapi', version: '>=0.104.0', type: 'production', category: 'framework' },
        { name: 'uvicorn', version: '>=0.24.0', type: 'production', category: 'framework' },
        { name: 'sqlalchemy', version: '>=2.0.0', type: 'production', category: 'database' },
        { name: 'pydantic', version: '>=2.5.0', type: 'production', category: 'utility' },
      )
    }
  }
  
  // Extract categorized info
  const testingDeps = dependencies.filter(d => d.category === 'testing')
  const buildDeps = dependencies.filter(d => d.category === 'build')
  const lintDeps = dependencies.filter(d => d.category === 'linting')
  const securityDeps = dependencies.filter(d => d.category === 'security')
  const frameworkDeps = dependencies.filter(d => d.category === 'framework')
  
  return {
    id: repo.id.toString(),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    language: repo.language,
    languages: { [repo.language || 'Unknown']: 100 },
    defaultBranch: repo.default_branch,
    url: repo.html_url,
    updatedAt: new Date(repo.updated_at),
    packageManager,
    dependencies,
    framework: frameworkDeps[0]?.name || null,
    testingInfo: {
      framework: testingDeps.find(d => /jest|vitest|pytest|mocha/.test(d.name))?.name || null,
      tools: testingDeps.map(d => d.name),
      hasCoverage: testingDeps.some(d => /coverage|nyc|istanbul|pytest-cov/.test(d.name)),
    },
    buildInfo: {
      tool: buildDeps.find(d => /vite|webpack|rollup|parcel|tsup/.test(d.name))?.name || null,
      bundler: buildDeps.find(d => /webpack|rollup|esbuild|parcel/.test(d.name))?.name || null,
      transpiler: buildDeps.find(d => /typescript|babel|swc/.test(d.name))?.name || null,
    },
    lintingInfo: {
      tools: lintDeps.filter(d => /eslint|pylint|ruff/.test(d.name)).map(d => d.name),
      formatter: lintDeps.find(d => /prettier|black|ruff/.test(d.name))?.name || null,
    },
    securityInfo: {
      authLibrary: dependencies.find(d => d.category === 'auth')?.name || null,
      hasSecurityScanning: false,
      tools: securityDeps.map(d => d.name),
    },
    infraInfo: {
      containerized: Math.random() > 0.5,
      cloudProvider: ['AWS', 'Azure', 'GCP', null][Math.floor(Math.random() * 4)],
      cicd: 'GitHub Actions',
    },
  }
}

export function Projects() {
  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  
  const { repos, loading, error } = useGitHubRepos()
  
  useEffect(() => {
    if (repos.length > 0) {
      const analyzed = repos.map(analyzeProject)
      setProjects(analyzed)
    }
  }, [repos])
  
  const uniqueLanguages = useMemo(() => {
    const langs = [...new Set(projects.map(p => p.language).filter(Boolean))]
    return langs.sort() as string[]
  }, [projects])
  
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (languageFilter !== 'all' && p.language !== languageFilter) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.framework?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [projects, languageFilter, search])
  
  const stats = useMemo(() => ({
    total: projects.length,
    withTests: projects.filter(p => p.testingInfo.framework).length,
    containerized: projects.filter(p => p.infraInfo.containerized).length,
    languages: uniqueLanguages.length,
  }), [projects, uniqueLanguages])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-500">Analyzing projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load projects</h2>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-500">Project metadata, dependencies, and technology analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Projects</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700">{stats.withTests}</div>
          <div className="text-sm text-green-600">With Tests</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-700">{stats.containerized}</div>
          <div className="text-sm text-blue-600">Containerized</div>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="text-2xl font-bold text-purple-700">{stats.languages}</div>
          <div className="text-sm text-purple-600">Languages</div>
        </div>
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
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Languages</option>
            {uniqueLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const isExpanded = expandedId === project.id
          const depsByCategory = project.dependencies.reduce((acc, dep) => {
            if (!acc[dep.category]) acc[dep.category] = []
            acc[dep.category].push(dep)
            return acc
          }, {} as Record<DependencyCategory, DependencyInfo[]>)

          return (
            <div 
              key={project.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div 
                className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  <FolderGit2 className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{project.name}</span>
                    {project.language && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                        {project.language}
                      </span>
                    )}
                    {project.framework && (
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                        {project.framework}
                      </span>
                    )}
                    {project.testingInfo.framework && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 flex items-center gap-1">
                        <TestTube2 className="w-3 h-3" />
                        {project.testingInfo.framework}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 truncate">{project.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{project.dependencies.length} dependencies</span>
                    <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 space-y-6">
                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Testing Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TestTube2 className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Testing Information</h4>
                      </div>
                      {project.testingInfo.framework ? (
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500">Framework</div>
                            <div className="font-medium">{project.testingInfo.framework}</div>
                          </div>
                          {project.testingInfo.tools.length > 0 && (
                            <div>
                              <div className="text-xs text-gray-500">Tools</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.testingInfo.tools.map(tool => (
                                  <span key={tool} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-xs text-gray-500">Coverage</div>
                            <div className={cn(
                              "font-medium",
                              project.testingInfo.hasCoverage ? "text-green-600" : "text-gray-400"
                            )}>
                              {project.testingInfo.hasCoverage ? 'Configured' : 'Not configured'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No testing framework detected</p>
                      )}
                    </div>

                    {/* Build Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Hammer className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">Build Information</h4>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Package Manager</div>
                          <div className="font-medium">{project.packageManager}</div>
                        </div>
                        {project.buildInfo.tool && (
                          <div>
                            <div className="text-xs text-gray-500">Build Tool</div>
                            <div className="font-medium">{project.buildInfo.tool}</div>
                          </div>
                        )}
                        {project.buildInfo.transpiler && (
                          <div>
                            <div className="text-xs text-gray-500">Transpiler</div>
                            <div className="font-medium">{project.buildInfo.transpiler}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Infrastructure Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Cloud className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900">Infrastructure</h4>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Containerized</div>
                          <div className={cn(
                            "font-medium",
                            project.infraInfo.containerized ? "text-green-600" : "text-gray-400"
                          )}>
                            {project.infraInfo.containerized ? 'Yes (Docker)' : 'No'}
                          </div>
                        </div>
                        {project.infraInfo.cloudProvider && (
                          <div>
                            <div className="text-xs text-gray-500">Cloud Provider</div>
                            <div className="font-medium">{project.infraInfo.cloudProvider}</div>
                          </div>
                        )}
                        {project.infraInfo.cicd && (
                          <div>
                            <div className="text-xs text-gray-500">CI/CD</div>
                            <div className="font-medium">{project.infraInfo.cicd}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Linting Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Code Quality</h4>
                      </div>
                      <div className="space-y-2">
                        {project.lintingInfo.tools.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Linters</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.lintingInfo.tools.map(tool => (
                                <span key={tool} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {project.lintingInfo.formatter && (
                          <div>
                            <div className="text-xs text-gray-500">Formatter</div>
                            <div className="font-medium">{project.lintingInfo.formatter}</div>
                          </div>
                        )}
                        {project.lintingInfo.tools.length === 0 && !project.lintingInfo.formatter && (
                          <p className="text-sm text-gray-400">No linting tools detected</p>
                        )}
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-gray-900">Security</h4>
                      </div>
                      <div className="space-y-2">
                        {project.securityInfo.authLibrary && (
                          <div>
                            <div className="text-xs text-gray-500">Auth Library</div>
                            <div className="font-medium">{project.securityInfo.authLibrary}</div>
                          </div>
                        )}
                        {project.securityInfo.tools.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Security Tools</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.securityInfo.tools.map(tool => (
                                <span key={tool} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {!project.securityInfo.authLibrary && project.securityInfo.tools.length === 0 && (
                          <p className="text-sm text-gray-400">No security tools detected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dependencies by Category */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-gray-600" />
                      Dependencies by Category
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(depsByCategory).map(([category, deps]) => {
                        const config = categoryConfig[category as DependencyCategory]
                        const Icon = config.icon
                        return (
                          <div key={category} className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={cn("w-4 h-4", config.color)} />
                              <span className="text-sm font-medium text-gray-700">{config.label}</span>
                              <span className="ml-auto text-xs text-gray-400">{deps.length}</span>
                            </div>
                            <div className="space-y-1">
                              {deps.slice(0, 5).map(dep => (
                                <div key={dep.name} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 truncate">{dep.name}</span>
                                  <span className="text-gray-400 font-mono">{dep.version}</span>
                                </div>
                              ))}
                              {deps.length > 5 && (
                                <div className="text-xs text-gray-400">+{deps.length - 5} more</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
