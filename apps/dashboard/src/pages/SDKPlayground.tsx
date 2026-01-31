import { useState, useEffect } from 'react'
import { 
  Play, 
  Copy, 
  Check,
  Terminal,
  Boxes,
  Loader2
} from 'lucide-react'
import { cn } from '../lib/utils'

const examples = [
  {
    id: 'errors',
    name: 'Error Handling',
    description: 'Capture and report errors with context',
    code: `// Capture an error with full context
sdk.errors()
  .capture(new Error('Connection timeout'))
  .withContext({ userId: 'user-123' })
  .inComponent('PlayerService')
  .duringOperation('fetchProfile')
  .withSeverity('error')
  .withTags('network', 'timeout')
  .send();`,
    output: `{
  "id": "err_1706712345_abc123",
  "message": "Connection timeout",
  "severity": "error",
  "component": "PlayerService",
  "operation": "fetchProfile",
  "tags": ["network", "timeout"],
  "timestamp": "2026-01-31T16:25:45.000Z"
}`,
  },
  {
    id: 'ui',
    name: 'UI Configuration',
    description: 'Get consistent component configurations',
    code: `// Get a button configuration
const buttonConfig = sdk.ui()
  .component('button')
  .variant('primary')
  .size('lg')
  .withA11y({ ariaLabel: 'Submit form' })
  .getConfig();

// Quick helpers
const primaryBtn = sdk.ui().button('primary', 'md');
const inputConfig = sdk.ui().input('outline', 'md');`,
    output: `{
  "component": "button",
  "variant": "primary",
  "size": "lg",
  "className": "inline-flex items-center...",
  "style": {
    "backgroundColor": "#3b82f6",
    "color": "#ffffff",
    "borderRadius": "0.375rem"
  },
  "a11y": {
    "ariaLabel": "Submit form"
  }
}`,
  },
  {
    id: 'telemetry',
    name: 'Telemetry',
    description: 'Track metrics and traces',
    code: `// Record a timing metric
sdk.telemetry()
  .metric('api.latency')
  .type('timer')
  .value(150)
  .unit('ms')
  .component('APIGateway')
  .tags({ endpoint: '/users', method: 'GET' })
  .send();

// Quick helpers
sdk.telemetry().increment('requests.count');
sdk.telemetry().gauge('memory.usage', 85);
sdk.telemetry().timing('db.query', 45);

// Time an async operation
const result = await sdk.telemetry().time(
  'fetchUser',
  () => userService.fetch(userId)
);`,
    output: `{
  "name": "api.latency",
  "type": "timer",
  "value": 150,
  "unit": "ms",
  "component": "APIGateway",
  "tags": {
    "endpoint": "/users",
    "method": "GET"
  },
  "timestamp": "2026-01-31T16:25:45.000Z"
}`,
  },
  {
    id: 'pipelines',
    name: 'Pipelines',
    description: 'Query and manage CI/CD pipelines',
    code: `// List running pipelines
const running = sdk.pipelines()
  .list()
  .status('running')
  .project('game-engine')
  .limit(10)
  .execute();

// Get pipeline stats
const stats = sdk.pipelines().stats();

// Trigger a new pipeline
const pipeline = await sdk.pipelines()
  .trigger('game-engine', 'main');`,
    output: `[
  {
    "id": "pipeline-1",
    "projectName": "game-engine",
    "ref": "main",
    "status": "running",
    "stages": ["build", "test", "deploy"],
    "user": { "name": "Alice Chen" }
  }
]

Stats: {
  "total": 10,
  "successRate": 0.85,
  "avgDuration": 245000
}`,
  },
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Manage organizational contacts',
    code: `// Search contacts
const engineers = sdk.contacts()
  .search('engineer')
  .inOrg('Engineering')
  .type('internal')
  .withTags('backend')
  .limit(5)
  .execute();

// Create a new contact
const contact = sdk.contacts().create({
  name: 'Jane Doe',
  email: 'jane@company.com',
  title: 'Senior Engineer',
  organization: 'Engineering',
  type: 'internal',
  tags: ['platform', 'devex'],
});`,
    output: `[
  {
    "id": "contact-1",
    "name": "John Martinez",
    "email": "john.martinez@company.com",
    "title": "Senior Engineer",
    "department": "Platform",
    "organization": "Engineering",
    "type": "internal",
    "tags": ["platform", "backend"]
  }
]`,
  },
]

export function SDKPlayground() {
  const [selectedExample, setSelectedExample] = useState(examples[0])
  const [code, setCode] = useState(examples[0].code)
  const [output, setOutput] = useState(examples[0].output)
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Update code when example changes
  useEffect(() => {
    setCode(selectedExample.code)
    setOutput(selectedExample.output)
    setHasRun(false)
  }, [selectedExample])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = async () => {
    setRunning(true)
    setHasRun(false)
    setHasError(false)
    setOutput('')
    
    // Simulate running the code with dynamic parsing
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      const result = parseAndExecuteCode(code)
      setOutput(result.output)
      setHasRun(true)
      setHasError(false)
      setRunning(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setOutput(`❌ Error: ${errorMessage}\n\n` +
        `Stack trace:\n` +
        `  at SDKPlayground.handleRun (SDKPlayground.tsx:196)\n` +
        `  at executeCode (sdk-runtime.ts:42)\n\n` +
        `💡 Tip: Check your syntax and ensure all SDK methods are valid.`)
      setHasRun(true)
      setHasError(true)
      setRunning(false)
    }
  }

  // Parse the code and generate dynamic output
  const parseAndExecuteCode = (inputCode: string): { output: string; success: boolean } => {
    const timestamp = new Date().toISOString()
    const lines = inputCode.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('//'))
    
    if (lines.length === 0) {
      throw new Error('No executable code found. Add some SDK calls to run.')
    }

    // Check for common syntax errors
    const openBraces = (inputCode.match(/\{/g) || []).length
    const closeBraces = (inputCode.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      throw new Error(`Syntax error: Mismatched braces. Found ${openBraces} '{' and ${closeBraces} '}'`)
    }

    const openParens = (inputCode.match(/\(/g) || []).length
    const closeParens = (inputCode.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      throw new Error(`Syntax error: Mismatched parentheses. Found ${openParens} '(' and ${closeParens} ')'`)
    }

    // Detect SDK methods being called
    const sdkCalls: string[] = []
    
    if (inputCode.includes('sdk.errors()')) {
      sdkCalls.push('errors')
    }
    if (inputCode.includes('sdk.auth()')) {
      sdkCalls.push('auth')
    }
    if (inputCode.includes('sdk.telemetry()')) {
      sdkCalls.push('telemetry')
    }
    if (inputCode.includes('sdk.pipelines()')) {
      sdkCalls.push('pipelines')
    }
    if (inputCode.includes('sdk.ui()')) {
      sdkCalls.push('ui')
    }
    if (inputCode.includes('sdk.contacts()')) {
      sdkCalls.push('contacts')
    }

    if (sdkCalls.length === 0 && !inputCode.includes('sdk.')) {
      throw new Error('No SDK calls detected. Use sdk.errors(), sdk.auth(), sdk.telemetry(), etc.')
    }

    // Generate dynamic output based on detected calls
    let output = ''

    if (sdkCalls.includes('errors')) {
      // Extract error details from code
      const errorIdMatch = inputCode.match(/withErrorId\(['"]([^'"]+)['"]\)/)
      const errorId = errorIdMatch ? errorIdMatch[1] : 'ERR-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      
      const teamMatch = inputCode.match(/team:\s*['"]([^'"]+)['"]/)
      const team = teamMatch ? teamMatch[1] : 'Unknown Team'
      
      const severityMatch = inputCode.match(/withSeverity\(['"]([^'"]+)['"]\)/)
      const severity = severityMatch ? severityMatch[1] : 'error'

      output += `✓ Error captured and sent successfully\n\n`
      output += JSON.stringify({
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        errorId: errorId,
        severity: severity,
        team: team,
        timestamp: timestamp,
        ticketCreated: `#INC-${Math.floor(Math.random() * 9000) + 1000}`
      }, null, 2)
    }

    if (sdkCalls.includes('telemetry')) {
      // Extract metric details
      const metricMatch = inputCode.match(/metric\(['"]([^'"]+)['"]\)/)
      const metricName = metricMatch ? metricMatch[1] : 'custom.metric'
      
      const valueMatch = inputCode.match(/value\((\d+)\)/)
      const value = valueMatch ? parseInt(valueMatch[1]) : Math.floor(Math.random() * 100)
      
      const unitMatch = inputCode.match(/unit\(['"]([^'"]+)['"]\)/)
      const unit = unitMatch ? unitMatch[1] : 'count'

      if (output) output += '\n\n---\n\n'
      output += `✓ Telemetry data sent\n\n`
      output += JSON.stringify({
        name: metricName,
        value: value,
        unit: unit,
        timestamp: timestamp,
        dashboardUrl: `https://metrics.example.com/${metricName.replace('.', '/')}`
      }, null, 2)
    }

    if (sdkCalls.includes('pipelines')) {
      // Extract pipeline details
      const projectMatch = inputCode.match(/trigger\(['"]([^'"]+)['"]/)
      const project = projectMatch ? projectMatch[1] : 'my-project'
      
      const branchMatch = inputCode.match(/trigger\([^,]+,\s*['"]([^'"]+)['"]/)
      const branch = branchMatch ? branchMatch[1] : 'main'

      if (output) output += '\n\n---\n\n'
      output += `✓ Pipeline triggered successfully\n\n`
      output += JSON.stringify({
        runId: `run-${Math.random().toString(36).substr(2, 8)}`,
        project: project,
        branch: branch,
        status: 'queued',
        triggeredAt: timestamp,
        url: `https://github.com/${project}/actions/runs/${Math.floor(Math.random() * 9000000000) + 1000000000}`
      }, null, 2)
    }

    if (sdkCalls.includes('auth')) {
      if (output) output += '\n\n---\n\n'
      output += `✓ Authentication successful\n\n`
      output += JSON.stringify({
        userId: `user-${Math.random().toString(36).substr(2, 8)}`,
        email: 'user@company.com',
        permissions: ['pipelines:read', 'pipelines:create', 'errors:read'],
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      }, null, 2)
    }

    if (sdkCalls.includes('ui')) {
      const componentMatch = inputCode.match(/component\(['"]([^'"]+)['"]\)/)
      const component = componentMatch ? componentMatch[1] : 'button'
      
      const variantMatch = inputCode.match(/variant\(['"]([^'"]+)['"]\)/)
      const variant = variantMatch ? variantMatch[1] : 'primary'

      if (output) output += '\n\n---\n\n'
      output += `✓ UI configuration retrieved\n\n`
      output += JSON.stringify({
        component: component,
        variant: variant,
        className: `btn btn-${variant} inline-flex items-center justify-center`,
        styles: {
          backgroundColor: variant === 'primary' ? '#3b82f6' : '#6b7280',
          color: '#ffffff',
          borderRadius: '0.375rem'
        }
      }, null, 2)
    }

    if (sdkCalls.includes('contacts')) {
      const searchMatch = inputCode.match(/search\(['"]([^'"]+)['"]\)/)
      const searchTerm = searchMatch ? searchMatch[1] : ''

      if (output) output += '\n\n---\n\n'
      output += `✓ Contacts query executed\n\n`
      output += JSON.stringify([
        {
          id: `contact-${Math.random().toString(36).substr(2, 6)}`,
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          title: 'Senior Engineer',
          team: 'Platform',
          matchedOn: searchTerm || 'all'
        }
      ], null, 2)
    }

    if (!output) {
      output = `✓ Code executed\n\nNo output to display. SDK calls were processed successfully.`
    }

    output += `\n\n// Executed at ${new Date().toLocaleTimeString()}`

    return { output, success: true }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SDK Playground</h1>
        <p className="text-gray-500">Explore the Fluent Facade API with interactive examples</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Example List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="font-semibold text-gray-900 mb-3">Examples</h2>
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setSelectedExample(example)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-colors",
                selectedExample.id === example.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="font-medium text-gray-900">{example.name}</div>
              <div className="text-sm text-gray-500">{example.description}</div>
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Code Editor */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Boxes className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedExample.name}</span>
                <span className="text-xs text-gray-500 ml-2">• Click to edit</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all",
                    copied 
                      ? "bg-green-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button 
                  onClick={handleRun}
                  disabled={running}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all",
                    running
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  )}
                >
                  {running ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 min-h-[300px] resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset border-none"
              spellCheck={false}
              placeholder="Edit your code here..."
            />
          </div>

          {/* Output */}
          <div className={cn(
            "rounded-xl border overflow-hidden transition-all",
            hasRun && !hasError && "border-green-300 bg-green-50/30",
            hasRun && hasError && "border-red-300 bg-red-50/30",
            !hasRun && "border-gray-200 bg-white"
          )}>
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 border-b",
              hasRun && !hasError && "border-green-200 bg-green-50",
              hasRun && hasError && "border-red-200 bg-red-50",
              !hasRun && "border-gray-200 bg-gray-50"
            )}>
              <Terminal className={cn(
                "w-4 h-4", 
                hasRun && !hasError && "text-green-600",
                hasRun && hasError && "text-red-600",
                !hasRun && "text-gray-500"
              )} />
              <span className={cn(
                "text-sm font-medium", 
                hasRun && !hasError && "text-green-700",
                hasRun && hasError && "text-red-700",
                !hasRun && "text-gray-700"
              )}>
                {hasRun && !hasError && "Output (Success)"}
                {hasRun && hasError && "Output (Error)"}
                {!hasRun && "Output (Preview)"}
              </span>
              {hasRun && !hasError && (
                <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Success
                </span>
              )}
              {hasRun && hasError && (
                <span className="ml-auto text-xs text-red-600 flex items-center gap-1">
                  ✕ Failed
                </span>
              )}
            </div>
            <pre className={cn(
              "p-4 text-sm font-mono overflow-x-auto scrollbar-thin whitespace-pre-wrap",
              hasRun && !hasError && "text-green-800 bg-green-50/50",
              hasRun && hasError && "text-red-800 bg-red-50/50",
              !hasRun && "text-gray-700 bg-gray-50/50"
            )}>
              <code>{output}</code>
            </pre>
          </div>

          {/* Quick Reference */}
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2">Fluent Facade Pattern</h3>
            <p className="text-blue-100 text-sm mb-3">
              The SDK uses a fluent interface pattern for chainable, discoverable APIs. 
              Each method returns `this` allowing you to chain calls together.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium mb-1">Benefits</div>
                <ul className="text-blue-100 space-y-1">
                  <li>• Discoverable API surface</li>
                  <li>• Type-safe with autocomplete</li>
                  <li>• AI agent friendly</li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-medium mb-1">Versioning</div>
                <ul className="text-blue-100 space-y-1">
                  <li>• Facade: v1.0.0</li>
                  <li>• Error Handling: v1.0.0</li>
                  <li>• UI Config: v1.0.0</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
