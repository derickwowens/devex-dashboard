import { useState } from 'react'
import { 
  Play, 
  Copy, 
  Check,
  Terminal,
  Boxes
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
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedExample.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {/* Code Block */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Boxes className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedExample.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  <Play className="w-4 h-4" />
                  Run
                </button>
              </div>
            </div>
            <pre className="p-4 text-sm font-mono text-gray-100 overflow-x-auto scrollbar-thin">
              <code>{selectedExample.code}</code>
            </pre>
          </div>

          {/* Output */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Output</span>
            </div>
            <pre className="p-4 text-sm font-mono text-gray-700 overflow-x-auto scrollbar-thin bg-gray-50/50">
              <code>{selectedExample.output}</code>
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
