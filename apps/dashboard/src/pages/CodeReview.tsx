import { useState, useMemo } from 'react'
import { 
  GitCommit, 
  MessageSquare, 
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  FileCode,
  Loader2,
  Filter,
  Search,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { cn, formatRelativeTime } from '../lib/utils'
import { useGitHubRepos, useGitHubCommits } from '../hooks/useGitHub'

type ReviewStatus = 'pending' | 'reviewed' | 'approved' | 'changes_requested'
type SuggestionType = 'improvement' | 'warning' | 'info' | 'security'

interface Suggestion {
  id: string
  type: SuggestionType
  file: string
  line: number
  message: string
  code?: string
}

interface Commit {
  id: string
  sha: string
  message: string
  author: string
  timestamp: Date
  status: ReviewStatus
  filesChanged: number
  additions: number
  deletions: number
  suggestions: Suggestion[]
  repo: string
  url: string
}

const statusConfig: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending Review', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  reviewed: { label: 'Reviewed', color: 'text-blue-700', bg: 'bg-blue-100' },
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
  changes_requested: { label: 'Changes Requested', color: 'text-red-700', bg: 'bg-red-100' },
}

const suggestionConfig: Record<SuggestionType, { icon: typeof Info; color: string; bg: string }> = {
  improvement: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  info: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' },
  security: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
}

// Mock data generator for suggestions since we don't have real AI analysis yet
const generateSuggestions = (commitId: string): Suggestion[] => {
  // Use simple hashing to make suggestions deterministic for the same commit
  const hash = commitId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const count = hash % 4 // 0 to 3 suggestions
  
  if (count === 0) return []

  const types: SuggestionType[] = ['improvement', 'warning', 'info', 'security']
  
  const codeExamples: Record<SuggestionType, { file: string; code: string; message: string }[]> = {
    improvement: [
      { file: 'src/components/App.tsx', code: 'const memoizedValue = useMemo(() => compute(a, b), [a, b])', message: 'Consider memoizing this computed value to prevent unnecessary recalculations on re-renders.' },
      { file: 'src/utils/helpers.ts', code: 'const result = items.filter(x => x.active).map(x => x.id)', message: 'Chain operations could be combined into a single reduce() for better performance with large arrays.' },
      { file: 'src/hooks/useData.ts', code: 'useEffect(() => {\n  fetchData()\n}, [userId])', message: 'Consider adding error handling and loading states to this data fetching effect.' },
    ],
    warning: [
      { file: 'src/components/Form.tsx', code: 'dangerouslySetInnerHTML={{ __html: userInput }}', message: 'Using dangerouslySetInnerHTML with user input can lead to XSS vulnerabilities. Sanitize the input first.' },
      { file: 'src/api/client.ts', code: 'const response = await fetch(url)\nconst data = response.json()', message: 'Missing await before response.json() - this will return a Promise instead of the actual data.' },
      { file: 'src/components/List.tsx', code: 'items.map((item, index) => <Item key={index} {...item} />)', message: 'Using array index as key can cause issues with reordering. Use a stable unique identifier instead.' },
    ],
    info: [
      { file: 'src/types/index.ts', code: 'interface User {\n  id: string\n  name: string\n  email?: string\n}', message: 'Consider adding JSDoc comments to document the interface fields for better code documentation.' },
      { file: 'src/constants.ts', code: 'export const API_URL = "https://api.example.com"', message: 'Consider moving this to environment variables for easier configuration across environments.' },
      { file: 'src/components/Button.tsx', code: 'export function Button({ onClick, children }) {', message: 'Adding TypeScript prop types would improve type safety and IDE autocompletion.' },
    ],
    security: [
      { file: 'src/auth/login.ts', code: 'localStorage.setItem("token", authToken)', message: 'Storing auth tokens in localStorage is vulnerable to XSS attacks. Consider using httpOnly cookies instead.' },
      { file: 'src/api/queries.ts', code: 'const query = `SELECT * FROM users WHERE id = ${userId}`', message: 'String interpolation in SQL queries is vulnerable to injection attacks. Use parameterized queries.' },
      { file: 'src/utils/crypto.ts', code: 'const hash = crypto.createHash("md5").update(password)', message: 'MD5 is cryptographically broken. Use bcrypt or Argon2 for password hashing.' },
    ],
  }

  const suggestions: Suggestion[] = []

  for (let i = 0; i < count; i++) {
    const typeIndex = (hash + i) % types.length
    const type = types[typeIndex]
    const examples = codeExamples[type]
    const example = examples[(hash + i) % examples.length]
    
    suggestions.push({
      id: `${commitId}-s${i}`,
      type,
      file: example.file,
      line: ((hash * (i + 1)) % 100) + 1,
      message: example.message,
      code: example.code
    })
  }
  return suggestions
}

export function CodeReview() {
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { repos, loading: reposLoading, error: reposError } = useGitHubRepos()
  const { commits: gitHubCommits, loading: commitsLoading, error: commitsError } = useGitHubCommits(repos, 10)

  // Transform GitHub commits to local Commit interface with mocked AI data
  const commits = useMemo<Commit[]>(() => {
    return gitHubCommits.map(c => {
      // Deterministic pseudo-random based on SHA for mock stats
      const shaInt = parseInt(c.sha.slice(0, 4), 16)
      
      const statusIndex = shaInt % 4
      const status: ReviewStatus = (['pending', 'reviewed', 'approved', 'changes_requested'] as const)[statusIndex]
      const filesChanged = (shaInt % 15) + 1
      const additions = (shaInt % 500) + 10
      const deletions = (shaInt % 200) + 5
      
      return {
        id: c.sha,
        sha: c.sha.substring(0, 7),
        message: c.commit.message,
        author: c.commit.author.name,
        timestamp: new Date(c.commit.author.date),
        status,
        filesChanged,
        additions,
        deletions,
        suggestions: generateSuggestions(c.sha),
        repo: c.repo,
        url: c.html_url
      }
    })
  }, [gitHubCommits])

  const selectedCommit = useMemo(() => 
    commits.find(c => c.id === selectedCommitId) || commits[0] || null,
    [commits, selectedCommitId]
  )

  const filteredCommits = useMemo(() => {
    return commits.filter(commit => {
      if (projectFilter !== 'all' && commit.repo !== projectFilter) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          commit.message.toLowerCase().includes(searchLower) ||
          commit.author.toLowerCase().includes(searchLower) ||
          commit.sha.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [commits, projectFilter, search])

  // Get unique projects for filter
  const projects = useMemo(() => 
    Array.from(new Set(commits.map(c => c.repo))).sort(),
    [commits]
  )

  if (reposLoading || commitsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-500">Loading commits...</p>
        </div>
      </div>
    )
  }

  if (reposError || commitsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load commits</h2>
          <p className="text-gray-500">
            {reposError?.message || commitsError?.message || 'An error occurred while fetching data from GitHub'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Code Review</h1>
        <p className="text-gray-500">AI-powered code review suggestions for your commits</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search commits by message, author, or SHA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[200px]"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commit List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-900">Recent Commits</h2>
          {filteredCommits.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
              No commits found
            </div>
          ) : (
            filteredCommits.map((commit) => {
              const config = statusConfig[commit.status]
              return (
                <button
                  key={commit.id}
                  onClick={() => setSelectedCommitId(commit.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-colors",
                    selectedCommit?.id === commit.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <GitCommit className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          {commit.repo}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(commit.timestamp)}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 truncate" title={commit.message}>
                        {commit.message}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span className="font-mono">{commit.sha}</span>
                        <span>•</span>
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          config.bg, config.color
                        )}>
                          {config.label}
                        </span>
                        {commit.suggestions.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            {commit.suggestions.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Commit Details */}
        <div className="lg:col-span-2">
          {selectedCommit ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCommit.message}
                  </h2>
                  <a 
                    href={selectedCommit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedCommit.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatRelativeTime(selectedCommit.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileCode className="w-4 h-4" />
                    {selectedCommit.filesChanged} files
                  </div>
                  <div className="text-green-600">+{selectedCommit.additions}</div>
                  <div className="text-red-600">-{selectedCommit.deletions}</div>
                  <div className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {selectedCommit.repo}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">
                  AI Review Suggestions ({selectedCommit.suggestions.length})
                </h3>

                {selectedCommit.suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No suggestions - code looks good!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCommit.suggestions.map((suggestion) => {
                      const config = suggestionConfig[suggestion.type]
                      const Icon = config.icon
                      return (
                        <div 
                          key={suggestion.id}
                          className={cn("rounded-lg p-4", config.bg)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={cn("w-5 h-5 mt-0.5", config.color)} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-xs font-medium uppercase",
                                  config.color
                                )}>
                                  {suggestion.type}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {suggestion.file}:{suggestion.line}
                                </span>
                              </div>
                              <p className="text-gray-700">{suggestion.message}</p>
                              {suggestion.code && (
                                <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-sm font-mono overflow-x-auto">
                                  {suggestion.code}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Select a commit to view review suggestions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
