import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  Bug,
  Package,
  FileCode,
  Loader2,
  ChevronDown,
  ChevronRight,
  GitBranch,
  FolderGit2
} from 'lucide-react'
import { cn } from '../lib/utils'

interface SecurityScan {
  id: string
  name: string
  type: 'dependencies' | 'code' | 'codeql'
  status: 'success' | 'warning' | 'error' | 'running' | 'pending'
  findings: number
  critical: number
  high: number
  medium: number
  low: number
  lastRun: Date
  url: string
}

interface BranchScans {
  branch: string
  scans: SecurityScan[]
  totalFindings: number
}

interface ProjectScans {
  project: string
  fullName: string
  branches: BranchScans[]
  totalFindings: number
}

const GITHUB_REPO = 'derickwowens/devex-dashboard'

export function SecurityScans() {
  const [projects, setProjects] = useState<ProjectScans[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['devex-dashboard']))
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set(['devex-dashboard/main']))

  useEffect(() => {
    loadScans()
  }, [])

  const loadScans = async () => {
    setLoading(true)
    
    // Simulate loading scan results grouped by project and branch
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockProjects: ProjectScans[] = [
      {
        project: 'devex-dashboard',
        fullName: GITHUB_REPO,
        totalFindings: 20,
        branches: [
          {
            branch: 'main',
            totalFindings: 20,
            scans: [
              {
                id: 'snyk-deps-main',
                name: 'Snyk Dependencies',
                type: 'dependencies',
                status: 'warning',
                findings: 3,
                critical: 0,
                high: 1,
                medium: 2,
                low: 0,
                lastRun: new Date(Date.now() - 1800000),
                url: `https://github.com/${GITHUB_REPO}/security/dependabot`
              },
              {
                id: 'snyk-code-main',
                name: 'Snyk Code (SAST)',
                type: 'code',
                status: 'warning',
                findings: 17,
                critical: 0,
                high: 2,
                medium: 8,
                low: 7,
                lastRun: new Date(Date.now() - 1800000),
                url: `https://github.com/${GITHUB_REPO}/security/code-scanning`
              },
              {
                id: 'codeql-main',
                name: 'CodeQL Analysis',
                type: 'codeql',
                status: 'success',
                findings: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                lastRun: new Date(Date.now() - 1800000),
                url: `https://github.com/${GITHUB_REPO}/security/code-scanning`
              }
            ]
          }
        ]
      }
    ]
    
    setProjects(mockProjects)
    setLoading(false)
    setLastRefresh(new Date())
  }

  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectName)) {
        next.delete(projectName)
      } else {
        next.add(projectName)
      }
      return next
    })
  }

  const toggleBranch = (branchKey: string) => {
    setExpandedBranches(prev => {
      const next = new Set(prev)
      if (next.has(branchKey)) {
        next.delete(branchKey)
      } else {
        next.add(branchKey)
      }
      return next
    })
  }

  const getStatusIcon = (status: SecurityScan['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: SecurityScan['type']) => {
    switch (type) {
      case 'dependencies':
        return <Package className="w-3.5 h-3.5" />
      case 'code':
        return <Bug className="w-3.5 h-3.5" />
      case 'codeql':
        return <FileCode className="w-3.5 h-3.5" />
    }
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const totalFindings = projects.reduce((acc, p) => acc + p.totalFindings, 0)
  const allScans = projects.flatMap(p => p.branches.flatMap(b => b.scans))
  const criticalCount = allScans.reduce((acc, s) => acc + s.critical, 0)
  const highCount = allScans.reduce((acc, s) => acc + s.high, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Security Scans</h2>
            <p className="text-sm text-gray-500">Snyk & CodeQL vulnerability scanning</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Updated {formatTime(lastRefresh)}
          </span>
          <button
            onClick={loadScans}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <a
            href={`https://github.com/${GITHUB_REPO}/security`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Security Tab
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 border-b border-gray-200">
        <div className="px-5 py-3 border-r border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
          <div className="text-xs text-gray-500">Projects</div>
        </div>
        <div className="px-5 py-3 border-r border-gray-200">
          <div className={cn(
            "text-2xl font-bold",
            totalFindings === 0 ? "text-green-600" : "text-yellow-600"
          )}>
            {totalFindings}
          </div>
          <div className="text-xs text-gray-500">Total Findings</div>
        </div>
        <div className="px-5 py-3 border-r border-gray-200">
          <div className={cn(
            "text-2xl font-bold",
            criticalCount === 0 ? "text-gray-400" : "text-red-600"
          )}>
            {criticalCount}
          </div>
          <div className="text-xs text-gray-500">Critical</div>
        </div>
        <div className="px-5 py-3">
          <div className={cn(
            "text-2xl font-bold",
            highCount === 0 ? "text-gray-400" : "text-orange-600"
          )}>
            {highCount}
          </div>
          <div className="text-xs text-gray-500">High</div>
        </div>
      </div>

      {/* Project → Branch → Scans Hierarchy */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          <span className="ml-2 text-gray-500">Loading scan results...</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {projects.map(project => {
            const isProjectExpanded = expandedProjects.has(project.project)
            
            return (
              <div key={project.project}>
                {/* Project Row */}
                <div 
                  className="px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleProject(project.project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isProjectExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <FolderGit2 className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">{project.project}</span>
                      <span className="text-xs text-gray-500">{project.branches.length} branch{project.branches.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {project.totalFindings > 0 ? (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                          {project.totalFindings} issues
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                          Clean
                        </span>
                      )}
                      <a
                        href={`https://github.com/${project.fullName}/security`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Branches */}
                {isProjectExpanded && project.branches.map(branch => {
                  const branchKey = `${project.project}/${branch.branch}`
                  const isBranchExpanded = expandedBranches.has(branchKey)
                  
                  return (
                    <div key={branchKey} className="bg-gray-50/50">
                      {/* Branch Row */}
                      <div 
                        className="px-5 py-2.5 pl-12 hover:bg-gray-100/50 transition-colors cursor-pointer"
                        onClick={() => toggleBranch(branchKey)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isBranchExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <GitBranch className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{branch.branch}</span>
                            <span className="text-xs text-gray-500">{branch.scans.length} scans</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {branch.totalFindings > 0 ? (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                {branch.totalFindings} issues
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                Clean
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Scans */}
                      {isBranchExpanded && (
                        <div className="pl-20 pr-5 pb-3 space-y-2">
                          {branch.scans.map(scan => (
                            <div 
                              key={scan.id} 
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(scan.status)}
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(scan.type)}
                                  <span className="text-sm text-gray-900">{scan.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {formatTime(scan.lastRun)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {scan.critical > 0 && (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                    {scan.critical} critical
                                  </span>
                                )}
                                {scan.high > 0 && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                    {scan.high} high
                                  </span>
                                )}
                                {scan.medium > 0 && (
                                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                    {scan.medium} med
                                  </span>
                                )}
                                {scan.low > 0 && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    {scan.low} low
                                  </span>
                                )}
                                {scan.findings === 0 && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                    Clean
                                  </span>
                                )}
                                <a
                                  href={scan.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Links */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Quick links:</span>
          <a
            href={`https://github.com/${GITHUB_REPO}/security/code-scanning`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Code Scanning Alerts
          </a>
          <a
            href={`https://github.com/${GITHUB_REPO}/security/dependabot`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Dependabot Alerts
          </a>
          <a
            href={`https://github.com/${GITHUB_REPO}/security/advisories`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Security Advisories
          </a>
          <a
            href="https://app.snyk.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 hover:underline"
          >
            Snyk Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
