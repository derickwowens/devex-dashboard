import { useState } from 'react'
import { Copy, Play, Check, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const CODE_EXAMPLES = {
  auth: `import { sdk } from '@federated/facade';

// 🔐 Authentication — No custom auth logic needed
await sdk.auth().loginWithCode(code).execute();

// Check permissions before actions
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  console.log('User can create pipelines');
}

// Get current user info
const user = await sdk.auth().getCurrentUser();
console.log('Logged in as:', user.name);`,

  errors: `import { sdk } from '@federated/facade';

// 🚨 Error Handling — Fast triage with ownership routing
try {
  await riskyOperation();
} catch (err) {
  sdk.errors()
    .capture(err)
    .withErrorId('AUTH-00142')
    .withOwnership({ 
      team: 'Platform Auth', 
      email: 'auth@company.com', 
      incidentGroup: '#auth-oncall' 
    })
    .withContext({ userId: user.id, action: 'login' })
    .send();
}`,

  telemetry: `import { sdk } from '@federated/facade';

// 📊 Telemetry — Metrics without the boilerplate
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .tags({ endpoint: '/users', method: 'GET' })
  .send();

// Track custom events
sdk.telemetry()
  .event('user.signup')
  .properties({ plan: 'pro', source: 'github' })
  .send();`,

  pipelines: `import { sdk } from '@federated/facade';

// 🚀 Pipelines — CI/CD operations at your fingertips
const run = await sdk.pipelines()
  .trigger('my-project', 'main')
  .withVariables({ DEPLOY_ENV: 'staging' })
  .execute();

console.log('Pipeline started:', run.id);

// Check pipeline status
const status = await sdk.pipelines()
  .getStatus(run.id)
  .execute();

console.log('Status:', status.conclusion);`,
}

type ExampleKey = keyof typeof CODE_EXAMPLES

const TABS: { key: ExampleKey; label: string; emoji: string }[] = [
  { key: 'auth', label: 'Auth', emoji: '🔐' },
  { key: 'errors', label: 'Errors', emoji: '🚨' },
  { key: 'telemetry', label: 'Telemetry', emoji: '📊' },
  { key: 'pipelines', label: 'Pipelines', emoji: '🚀' },
]

export function ApiExplorer() {
  const [activeTab, setActiveTab] = useState<ExampleKey>('auth')
  const [code, setCode] = useState(CODE_EXAMPLES.auth)
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)

  const handleTabChange = (tab: ExampleKey) => {
    setActiveTab(tab)
    setCode(CODE_EXAMPLES[tab])
    setOutput(null)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput(null)
    
    // Simulate running the code
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock output based on the active tab
    const outputs: Record<ExampleKey, string> = {
      auth: `✓ Authentication successful
✓ User has 'pipelines:create' permission
→ Logged in as: Derick Owens (derick@company.com)`,
      errors: `✓ Error captured and sent to Platform Auth team
→ Error ID: AUTH-00142
→ Ticket created: #INC-2847
→ Slack notification sent to #auth-oncall`,
      telemetry: `✓ Metric 'api.latency' recorded: 150ms
✓ Event 'user.signup' tracked
→ Dashboard: https://metrics.company.com/api-latency`,
      pipelines: `✓ Pipeline triggered successfully
→ Run ID: run-8f4a2b1c
→ Status: in_progress
→ View: https://github.com/myorg/my-project/actions/runs/123`,
    }
    
    setOutput(outputs[activeTab])
    setRunning(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">API Explorer — One Import, Everything You Need</h2>
          <p className="text-sm text-gray-500">Edit the code below and click Run to see it in action</p>
        </div>
        <a 
          href="https://github.com/derickwowens/devex-dashboard/blob/main/docs/sdk/overview.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Full API Docs
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 px-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              activeTab === tab.key 
                ? "text-indigo-600" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>
      
      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 min-h-[280px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
          spellCheck={false}
        />
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              copied 
                ? "bg-green-500 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              running
                ? "bg-indigo-400 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            {running ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Output Panel */}
      {output && (
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Output</div>
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  )
}
