import { 
  GitBranch, 
  Layers, 
  Shield, 
  Zap, 
  Package, 
  RefreshCw,
  Building2,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  Puzzle,
  TrendingDown
} from 'lucide-react'
import { cn } from '../lib/utils'

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

function BenefitCard({ icon, title, description, color }: BenefitCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", color)}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

interface CodeComparisonProps {
  title: string
  before: string
  after: string
  beforeLines: number
  afterLines: number
}

function CodeComparison({ title, before, after, beforeLines, afterLines }: CodeComparisonProps) {
  const reduction = Math.round((1 - afterLines / beforeLines) * 100)
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          <span className="text-red-600">{beforeLines} lines</span>
          <ArrowRight className="w-4 h-4 inline mx-2" />
          <span className="text-green-600">{afterLines} lines</span>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {reduction}% reduction
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-gray-700">Before (Without Components)</span>
          </div>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{before}</code>
          </pre>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-700">After (With Components)</span>
          </div>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{after}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export function CICDPhilosophy() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CI/CD Philosophy</h1>
            <p className="text-gray-500">Standardizing pipelines across the ecosystem</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-semibold mb-4">The Problem We're Solving</h2>
        <p className="text-purple-100 mb-6">
          In a multi-team organization, CI/CD pipelines often become fragmented. Each team maintains their own 
          configurations, leading to inconsistent security scanning, duplicated boilerplate code, and difficulty 
          enforcing organizational standards. When tools need to be updated or migrated, the effort multiplies 
          across every project.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">200-500</div>
            <div className="text-purple-200 text-sm">Lines of CI/CD per project (typical)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">2-4 hrs</div>
            <div className="text-purple-200 text-sm">Time to onboard new project</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl font-bold">Weeks</div>
            <div className="text-purple-200 text-sm">To migrate security tools org-wide</div>
          </div>
        </div>
      </div>

      {/* Our Solution */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Solution: GitLab Components</h2>
        <p className="text-gray-600 mb-6">
          We leverage GitLab's CI/CD Components to create reusable, versioned, and parameterized job templates 
          that can be shared across all teams. This approach transforms how we manage pipelines at scale.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BenefitCard
            icon={<Puzzle className="w-6 h-6 text-white" />}
            title="Parameterized Inputs"
            description="Same template, different configurations. Teams customize behavior without duplicating code."
            color="bg-blue-500"
          />
          <BenefitCard
            icon={<Package className="w-6 h-6 text-white" />}
            title="Versioned Reusability"
            description="Pin to specific versions for stability. Updates don't break existing pipelines."
            color="bg-green-500"
          />
          <BenefitCard
            icon={<Building2 className="w-6 h-6 text-white" />}
            title="Centralized Management"
            description="Single source of truth for security policies, quality gates, and tooling configurations."
            color="bg-purple-500"
          />
          <BenefitCard
            icon={<TrendingDown className="w-6 h-6 text-white" />}
            title="Reduced Duplication"
            description="Clean, maintainable CI files. Focus on what makes your project unique."
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Parameterized Inputs Detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Puzzle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Parameterized Inputs</h3>
            <p className="text-sm text-gray-500">Customize components for your team's needs</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Components accept inputs, allowing the same template to be used with different configurations 
          across various projects. Parameters can control Docker images, script commands, stages, 
          thresholds, and any other configurable aspect of a job.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Team A - Stricter Requirements</div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
<code>{`- component: security-scanning@1.0.0
  inputs:
    severity_threshold: low
    fail_on_issues: true
    coverage_threshold: 90`}</code>
            </pre>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Team B - Legacy Project</div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
<code>{`- component: security-scanning@1.0.0
  inputs:
    severity_threshold: high
    fail_on_issues: false
    coverage_threshold: 60`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Versioned Reusability Detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Versioned Reusability</h3>
            <p className="text-sm text-gray-500">Seamless tooling migrations</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Components can be versioned, ensuring that updates to a template <strong>do not break existing 
          pipelines</strong> in other projects. Teams can pin to specific versions for stability, use 
          semantic versioning to control update adoption, and test new versions before upgrading.
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-medium text-amber-900">Tooling Migration Example</div>
              <p className="text-sm text-amber-700 mt-1">
                If we switch dependency scanning from Snyk to Trivy, we release a new component version. 
                Teams migrate at their own pace while the platform team maintains both versions during transition.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-700">Version 1.x - Uses Snyk</span>
            </div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
<code>{`include:
  - component: security-scanning@1.0.0
# Uses: snyk test, snyk code test
# Outputs: Snyk JSON reports`}</code>
            </pre>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">Version 2.x - Migrated to Trivy</span>
            </div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
<code>{`include:
  - component: security-scanning@2.0.0
# Uses: trivy fs, trivy image
# Outputs: GitLab SAST format`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Code Comparison */}
      <CodeComparison
        title="Security Scanning Configuration"
        beforeLines={45}
        afterLines={8}
        before={`security:snyk:
  stage: security
  image: snyk/snyk:node
  variables:
    SNYK_TOKEN: $SNYK_TOKEN
    SNYK_ORG: "my-org"
  before_script:
    - mkdir -p security-reports
  script:
    - |
      snyk test \\
        --org=$SNYK_ORG \\
        --severity-threshold=high \\
        --json > report.json
      snyk monitor --org=$SNYK_ORG
  artifacts:
    paths:
      - security-reports/
    reports:
      dependency_scanning: report.json
    expire_in: 30 days
  allow_failure: false
  # ... 20+ more lines`}
        after={`include:
  - component: security-scanning@1.0.0
    inputs:
      snyk_org: "my-org"
      severity_threshold: high
      fail_on_issues: true

# That's it!`}
      />

      {/* Parallel Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Parallel Matrix Execution</h3>
            <p className="text-sm text-gray-500">Run jobs across multiple configurations simultaneously</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          The <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">parallel:matrix</code> feature 
          allows running the same job with different variable combinations simultaneously, dramatically 
          reducing pipeline execution time.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Matrix Definition</div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
<code>{`test:e2e:
  parallel:
    matrix:
      - BROWSER: [chromium, firefox, webkit]
        VIEWPORT: [desktop, mobile]
  script:
    - npx playwright test \\
        --project=$BROWSER \\
        --viewport=$VIEWPORT`}</code>
            </pre>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Result: 6 Parallel Jobs</div>
            <div className="space-y-2">
              {['chromium/desktop', 'chromium/mobile', 'firefox/desktop', 'firefox/mobile', 'webkit/desktop', 'webkit/mobile'].map((combo) => (
                <div key={combo} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">test:e2e [{combo}]</span>
                  <span className="text-xs text-gray-400 ml-auto">~2min</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total time (parallel)</span>
                  <span className="text-sm font-bold text-green-600">~2 min</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs">vs. sequential</span>
                  <span className="text-xs">~12 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Components */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'security-scanning',
              version: '1.0.0',
              description: 'Snyk dependency, code, container, and IaC scanning',
              icon: <Shield className="w-5 h-5" />,
              color: 'bg-red-500',
              inputs: ['snyk_org', 'severity_threshold', 'fail_on_issues']
            },
            {
              name: 'quality-gates',
              version: '1.0.0',
              description: 'Coverage, complexity, and duplication thresholds',
              icon: <CheckCircle2 className="w-5 h-5" />,
              color: 'bg-green-500',
              inputs: ['coverage_threshold', 'complexity_threshold', 'duplication_threshold']
            },
            {
              name: 'notifications',
              version: '1.0.0',
              description: 'Slack, Teams, and email alerts for pipeline events',
              icon: <Zap className="w-5 h-5" />,
              color: 'bg-yellow-500',
              inputs: ['slack_channel', 'notify_on_failure', 'notify_on_success']
            },
            {
              name: 'deploy-template',
              version: '1.0.0',
              description: 'Kubernetes deployment with canary and rollback support',
              icon: <Layers className="w-5 h-5" />,
              color: 'bg-blue-500',
              inputs: ['environment', 'replicas', 'canary_percentage']
            },
            {
              name: 'docker-build',
              version: '1.0.0',
              description: 'Multi-arch container builds with caching',
              icon: <Package className="w-5 h-5" />,
              color: 'bg-purple-500',
              inputs: ['platforms', 'cache_enabled', 'push_latest']
            },
            {
              name: 'test-runner',
              version: '1.0.0',
              description: 'Parallel test execution with sharding support',
              icon: <FileCode2 className="w-5 h-5" />,
              color: 'bg-indigo-500',
              inputs: ['test_framework', 'shards', 'coverage_report']
            },
          ].map(component => (
            <div key={component.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", component.color)}>
                  {component.icon}
                </div>
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  v{component.version}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{component.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{component.description}</p>
              <div className="flex flex-wrap gap-1">
                {component.inputs.map(input => (
                  <span key={input} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {input}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-semibold mb-6">Component Strategy ROI</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-3 font-medium">Metric</th>
                <th className="pb-3 font-medium text-red-200">Without Components</th>
                <th className="pb-3 font-medium text-green-200">With Components</th>
                <th className="pb-3 font-medium">Improvement</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/10">
                <td className="py-3">Lines of CI/CD per project</td>
                <td className="py-3 text-red-200">200-500</td>
                <td className="py-3 text-green-200">20-50</td>
                <td className="py-3 font-semibold">90% reduction</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3">Time to onboard new project</td>
                <td className="py-3 text-red-200">2-4 hours</td>
                <td className="py-3 text-green-200">15-30 minutes</td>
                <td className="py-3 font-semibold">85% faster</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3">Security tool migration</td>
                <td className="py-3 text-red-200">Weeks (each project)</td>
                <td className="py-3 text-green-200">Days (central update)</td>
                <td className="py-3 font-semibold">10x faster</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3">Consistency across teams</td>
                <td className="py-3 text-red-200">Variable</td>
                <td className="py-3 text-green-200">Guaranteed</td>
                <td className="py-3 font-semibold">100% consistent</td>
              </tr>
              <tr>
                <td className="py-3">Maintenance burden</td>
                <td className="py-3 text-red-200">Distributed (N teams)</td>
                <td className="py-3 text-green-200">Centralized (1 team)</td>
                <td className="py-3 font-semibold">N:1 reduction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Include Components</h3>
              <p className="text-sm text-gray-500">
                Add the component include statements to your <code className="text-xs bg-gray-100 px-1 rounded">.gitlab-ci.yml</code>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Configure Inputs</h3>
              <p className="text-sm text-gray-500">
                Customize the component behavior with inputs specific to your team's requirements
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Run Your Pipeline</h3>
              <p className="text-sm text-gray-500">
                Push your changes and watch the standardized jobs execute with full parallelization
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Minimal Example</div>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
<code>{`include:
  - component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
  - component: $CI_SERVER_FQDN/devex/components/quality-gates@1.0.0
  - component: $CI_SERVER_FQDN/devex/components/notifications@1.0.0
    inputs:
      slack_channel: "#my-team-builds"

stages:
  - build
  - test
  - security
  - quality
  - deploy

build:
  stage: build
  script:
    - npm ci && npm run build

test:
  stage: test
  script:
    - npm test`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
