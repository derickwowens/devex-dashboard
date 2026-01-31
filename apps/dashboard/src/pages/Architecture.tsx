import { useState } from 'react'
import { 
  Server, 
  Boxes, 
  Cloud,
  Database,
  Workflow,
  Globe,
  BarChart3,
  Code2,
  Puzzle,
  Settings,
  MessageSquare,
  Layers,
  RefreshCw,
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'
import { 
  infrastructurePatterns as infraPatternsData, 
  architecturePatterns as archPatternsData,
  lastUpdated
} from '../data/architecture-docs'

type TabId = 'infrastructure' | 'patterns'

interface InfraPattern {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  diagram: string
  benefits: string[]
  whenToUse: string[]
}

interface ArchPattern {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  codeExample?: string
  benefits?: { title: string; description: string }[]
  table?: { headers: string[]; rows: string[][] }
}

// UI configuration for infrastructure patterns (maps to generated data)
const infraPatternUI: Record<string, { icon: React.ReactNode; color: string }> = {
  'Serverless API Pattern': { icon: <Cloud className="w-6 h-6" />, color: 'bg-orange-500' },
  'Container Platform Pattern': { icon: <Boxes className="w-6 h-6" />, color: 'bg-blue-500' },
  'Event-Driven Pattern': { icon: <Workflow className="w-6 h-6" />, color: 'bg-purple-500' },
  'Static Site Pattern': { icon: <Globe className="w-6 h-6" />, color: 'bg-green-500' },
  'Data Lake Pattern': { icon: <BarChart3 className="w-6 h-6" />, color: 'bg-indigo-500' },
}

// UI configuration for architecture patterns (maps to generated data)
const archPatternUI: Record<string, { icon: React.ReactNode; color: string }> = {
  'Fluent Facade Pattern': { icon: <Layers className="w-6 h-6" />, color: 'bg-indigo-500' },
  'Plugin Architecture': { icon: <Puzzle className="w-6 h-6" />, color: 'bg-purple-500' },
  'Centralized Cross-Cutting Concerns': { icon: <Settings className="w-6 h-6" />, color: 'bg-amber-500' },
  'Event-Driven Communication': { icon: <MessageSquare className="w-6 h-6" />, color: 'bg-green-500' },
  'Configuration Hierarchy': { icon: <RefreshCw className="w-6 h-6" />, color: 'bg-blue-500' },
}

// Combine generated data with UI configuration for infrastructure patterns
const infrastructurePatterns: InfraPattern[] = infraPatternsData.map((p, i) => ({
  id: `infra-${i}`,
  title: p.title,
  description: p.description,
  diagram: p.diagram,
  icon: infraPatternUI[p.title]?.icon || <Server className="w-6 h-6" />,
  color: infraPatternUI[p.title]?.color || 'bg-gray-500',
  benefits: p.benefits.length > 0 ? p.benefits : ['Auto-scaling', 'Cost effective', 'Managed service'],
  whenToUse: p.whenToUse.length > 0 ? p.whenToUse : ['General purpose'],
}))

// Combine generated data with UI configuration for architecture patterns
const architecturePatterns: ArchPattern[] = archPatternsData.map((p, i) => ({
  id: `arch-${i}`,
  title: p.title,
  description: p.description,
  icon: archPatternUI[p.title]?.icon || <Code2 className="w-6 h-6" />,
  color: archPatternUI[p.title]?.color || 'bg-gray-500',
  codeExample: p.codeExample,
  benefits: p.benefits,
  table: p.table,
}))

function InfraPatternCard({ pattern }: { pattern: InfraPattern }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button 
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0", pattern.color)}>
          {pattern.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{pattern.description}</p>
        </div>
        <ChevronRight className={cn(
          "w-5 h-5 text-gray-400 transition-transform shrink-0",
          expanded && "rotate-90"
        )} />
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono">{pattern.diagram}</pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits</h4>
              <ul className="space-y-1">
                {pattern.benefits.map(benefit => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">When to Use</h4>
              <ul className="space-y-1">
                {pattern.whenToUse.map(use => (
                  <li key={use} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ArchPatternCard({ pattern }: { pattern: ArchPattern }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0", pattern.color)}>
          {pattern.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{pattern.description}</p>
        </div>
      </div>
      
      {pattern.codeExample && (
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="text-xs text-gray-100 font-mono">{pattern.codeExample}</pre>
        </div>
      )}
      
      {pattern.benefits && (
        <div className="grid grid-cols-2 gap-3">
          {pattern.benefits.map(benefit => (
            <div key={benefit.title} className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900">{benefit.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{benefit.description}</div>
            </div>
          ))}
        </div>
      )}
      
      {pattern.table && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {pattern.table.headers.map(header => (
                  <th key={header} className="text-left py-2 font-medium text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pattern.table.rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 text-gray-600">
                      {j === 1 ? (
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{cell}</code>
                      ) : j === 2 ? (
                        <code className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{cell}</code>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function Architecture() {
  const [activeTab, setActiveTab] = useState<TabId>('patterns')
  
  const tabs = [
    { id: 'patterns' as TabId, label: 'Design Patterns', icon: Code2 },
    { id: 'infrastructure' as TabId, label: 'Infrastructure', icon: Server },
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Architecture & Design Patterns</h1>
            <p className="text-gray-500">Recommended patterns for the Ecosystem platform</p>
          </div>
        </div>
        
        <a 
          href="http://localhost:8000/architecture/patterns/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <FileText className="w-4 h-4" />
          View in MkDocs
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      
      {/* Auto-update notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <div className="font-medium text-blue-900">Documentation Auto-Updates</div>
          <p className="text-sm text-blue-700 mt-1">
            This documentation is derived from <code className="bg-blue-100 px-1 rounded">docs/architecture/patterns.md</code> and{' '}
            <code className="bg-blue-100 px-1 rounded">docs/architecture/infrastructure.md</code>. 
            Changes to these files will be reflected here after rebuilding.
            <span className="block mt-1 text-xs text-blue-500">Last synced: {new Date(lastUpdated).toLocaleString()}</span>
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Design Philosophy</h2>
            <p className="text-indigo-100">
              Our architecture is built on the principle of <strong>reducing cognitive load</strong> for developers. 
              By standardizing patterns and providing a unified SDK facade, teams can focus on business logic 
              instead of infrastructure concerns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {architecturePatterns.map(pattern => (
              <ArchPatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">AWS Infrastructure Patterns</h2>
            <p className="text-orange-100">
              Standardized infrastructure patterns for deploying services on AWS. These patterns provide 
              proven architectures for common use cases, ensuring consistency and best practices across teams.
            </p>
          </div>
          
          <div className="space-y-3">
            {infrastructurePatterns.map(pattern => (
              <InfraPatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
          
          {/* Decision Matrix */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pattern Decision Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Use Case</th>
                    <th className="text-left py-2 font-medium text-gray-700">Recommended Pattern</th>
                    <th className="text-left py-2 font-medium text-gray-700">Primary Services</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">REST API (stateless)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Serverless</span></td>
                    <td className="py-2 text-gray-500">API Gateway, Lambda, DynamoDB</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">WebSocket / Real-time</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Container</span></td>
                    <td className="py-2 text-gray-500">ALB, ECS Fargate, ElastiCache</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">Async Processing</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Event-Driven</span></td>
                    <td className="py-2 text-gray-500">EventBridge, SQS, Lambda</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">Dashboard / SPA</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Static Site</span></td>
                    <td className="py-2 text-gray-500">CloudFront, S3, Route53</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Analytics / BI</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">Data Lake</span></td>
                    <td className="py-2 text-gray-500">Kinesis, S3, Athena, QuickSight</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
