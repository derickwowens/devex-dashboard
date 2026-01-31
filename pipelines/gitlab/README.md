# GitLab CI/CD Pipeline Standardization

This directory contains standardized GitLab CI/CD pipeline configurations that demonstrate parallelization patterns, reusable components, and consistent security scanning across teams.

## Quick Start

```yaml
# Include components in your .gitlab-ci.yml
include:
  # Security scanning with Snyk
  - component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
    inputs:
      severity_threshold: high
      fail_on_issues: false
  
  # GitLab Pages deployment
  - component: $CI_SERVER_FQDN/devex/components/pages@1.0.0
    inputs:
      framework: mkdocs
      docs_dir: docs
```

## Available Components

| Component | Purpose | Key Inputs |
|-----------|---------|------------|
| `security-scanning` | Snyk vulnerability detection | `severity_threshold`, `fail_on_issues`, `snyk_org` |
| `pages` | GitLab Pages deployment | `framework`, `docs_dir`, `output_dir` |
| `quality-gates` | Code coverage & complexity | `coverage_threshold`, `complexity_max` |
| `notifications` | Slack/Teams alerts | `webhook_url`, `channel` |
| `deploy-template` | Kubernetes deployment | `namespace`, `replicas` |

## Key Concepts

### 1. Parallel Matrix Execution

The `parallel:matrix` feature allows running the same job with different variable combinations simultaneously:

```yaml
test:e2e:
  parallel:
    matrix:
      - BROWSER: [chromium, firefox, webkit]
  script:
    - npx playwright test --project=$BROWSER
```

This creates 3 parallel jobs, one for each browser, reducing total pipeline time significantly.

### 2. GitLab Components

Components are reusable CI/CD templates that can be shared across projects and teams:

```yaml
include:
  - component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
    inputs:
      stage: security
      severity_threshold: high
```

## Why Use GitLab Components? Strategic Benefits

### Parameterized Inputs

Components accept inputs, allowing the same template to be used with different configurations across various projects. This means teams can customize behavior without duplicating code:

```yaml
# Team A - stricter security requirements
- component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
  inputs:
    severity_threshold: low
    fail_on_issues: true

# Team B - more lenient for legacy projects
- component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
  inputs:
    severity_threshold: high
    fail_on_issues: false
```

Parameters can control Docker images, script commands, stages, thresholds, and any other configurable aspect of a job.

### Versioned Reusability

Components can be versioned, ensuring that updates to a template **do not break existing pipelines** in other projects. Teams can:

- Pin to a specific version for stability (`@1.0.0`)
- Use semantic versioning to control update adoption (`@1.x` for minor updates)
- Test new versions in non-production environments before upgrading

**Tooling Migration Example:** If we switch dependency scanning from Snyk to another tool (e.g., Trivy), we simply release a new component version with the updated scripting:

```yaml
# Version 1.x uses Snyk
- component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0

# Version 2.x migrates to Trivy - teams upgrade when ready
- component: $CI_SERVER_FQDN/devex/components/security-scanning@2.0.0
```

Teams can migrate at their own pace while the platform team maintains both versions during the transition period.

### Centralized Management

Templated jobs are stored in a **central project**, providing:

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | One place to update security policies, quality gates, and tooling |
| **Audit Trail** | Git history shows who changed what and when |
| **Review Process** | Changes go through MR review before affecting all teams |
| **Documentation** | Centralized docs for all available components |
| **Compliance** | Enforce organizational standards consistently |

```
devex/components/                    # Central component repository
├── security-scanning/
│   ├── template.yml                 # Component definition
│   ├── CHANGELOG.md                 # Version history
│   └── README.md                    # Usage documentation
├── quality-gates/
├── notifications/
└── deploy-template/
```

### Reduced Duplication

Components **significantly reduce CI/CD boilerplate code**, leading to cleaner and more maintainable `.gitlab-ci.yml` files:

**Before (without components):** ~200 lines per project
```yaml
# Each project duplicates security scanning setup
security:snyk:
  stage: security
  image: snyk/snyk:node
  variables:
    SNYK_TOKEN: $SNYK_TOKEN
    SNYK_ORG: "my-org"
  before_script:
    - mkdir -p security-reports
  script:
    - snyk test --severity-threshold=high --json > report.json
    - snyk monitor
  # ... 50+ more lines of configuration
  artifacts:
    paths:
      - security-reports/
    reports:
      dependency_scanning: gl-dependency-scanning-report.json
```

**After (with components):** ~10 lines per project
```yaml
include:
  - component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0
    inputs:
      snyk_org: "my-org"
      severity_threshold: high

# That's it - all the complexity is abstracted away
```

### Summary: Component Strategy ROI

| Metric | Without Components | With Components |
|--------|-------------------|-----------------|
| Lines of CI/CD per project | 200-500 | 20-50 |
| Time to onboard new project | 2-4 hours | 15-30 minutes |
| Security tool migration | Weeks (each project) | Days (central update) |
| Consistency across teams | Variable | Guaranteed |
| Maintenance burden | Distributed | Centralized |

### 3. Security Scanning with Snyk

Our standardized security scanning covers four dimensions:

| Scan Type | Purpose | Tool |
|-----------|---------|------|
| `dependencies` | Vulnerable npm/pip/etc packages | `snyk test` |
| `code` | Static analysis (SAST) | `snyk code test` |
| `container` | Docker image vulnerabilities | `snyk container test` |
| `iac` | Infrastructure misconfigurations | `snyk iac test` |

## Directory Structure

```
pipelines/gitlab/
├── .gitlab-ci.yml              # Main pipeline configuration
├── .gitlab/
│   └── components/
│       ├── security-scanning.yml   # Security scan templates
│       ├── quality-gates.yml       # Code quality enforcement
│       └── notifications.yml       # Slack/Teams alerts
├── scripts/
│   └── convert-snyk-to-gitlab.js   # Snyk → GitLab report converter
└── README.md                       # This file
```

## Usage

### For New Projects

1. Copy `.gitlab-ci.yml` to your project root
2. Customize variables for your environment
3. Include the components you need

### Minimal Setup

```yaml
include:
  - component: $CI_SERVER_FQDN/devex/components/security-scanning@1.0.0

stages:
  - build
  - test
  - security

build:
  stage: build
  script:
    - npm ci
    - npm run build

test:
  stage: test
  script:
    - npm test

security:snyk:
  extends: .snyk-dependency-scan
```

### Multi-Environment Deployment

```yaml
deploy:
  parallel:
    matrix:
      - ENVIRONMENT: [dev, staging]
        K8S_NAMESPACE: [devex-dev, devex-staging]
      - ENVIRONMENT: [prod]
        K8S_NAMESPACE: [devex-prod]
  script:
    - kubectl set image deployment/app app=$IMAGE -n $K8S_NAMESPACE
  rules:
    - if: $ENVIRONMENT == "prod"
      when: manual
    - when: on_success
```

## Parallelization Patterns

### Pattern 1: Test Sharding

Split large test suites across multiple runners:

```yaml
test:unit:
  parallel:
    matrix:
      - TEST_SHARD: [1, 2, 3, 4]
  script:
    - npm test -- --shard=$TEST_SHARD/4
```

### Pattern 2: Multi-Platform Builds

Build for multiple architectures simultaneously:

```yaml
build:docker:
  parallel:
    matrix:
      - PLATFORM: [linux/amd64, linux/arm64]
  script:
    - docker buildx build --platform $PLATFORM .
```

### Pattern 3: Environment Matrix

Deploy to multiple environments with different configurations:

```yaml
deploy:
  parallel:
    matrix:
      - ENV: [dev, staging, prod]
        REPLICAS: [1, 2, 3]
```

### Pattern 4: Tool Matrix

Run multiple linters/scanners in parallel:

```yaml
quality:lint:
  parallel:
    matrix:
      - LINT_TYPE: [eslint, prettier, typescript, stylelint]
  script:
    - npm run lint:$LINT_TYPE
```

## Component Inputs

### security-scanning.yml

| Input | Default | Description |
|-------|---------|-------------|
| `stage` | `security` | Pipeline stage |
| `snyk_org` | `federated-devex` | Snyk organization ID |
| `severity_threshold` | `high` | Minimum severity to report |
| `fail_on_issues` | `false` | Fail pipeline on vulnerabilities |

### quality-gates.yml

| Input | Default | Description |
|-------|---------|-------------|
| `stage` | `quality` | Pipeline stage |
| `coverage_threshold` | `80` | Minimum code coverage % |
| `complexity_threshold` | `15` | Maximum cyclomatic complexity |
| `duplication_threshold` | `3` | Maximum code duplication % |

### notifications.yml

| Input | Default | Description |
|-------|---------|-------------|
| `stage` | `.post` | Pipeline stage |
| `slack_channel` | `#devex-builds` | Target Slack channel |
| `notify_on_failure` | `true` | Send alerts on failure |
| `notify_on_success` | `false` | Send alerts on success |

## Environment Variables

Required secrets (set in GitLab CI/CD Settings):

| Variable | Description |
|----------|-------------|
| `SNYK_TOKEN` | Snyk API token |
| `SONAR_TOKEN` | SonarQube authentication token |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |
| `KUBE_CONFIG` | Base64-encoded kubeconfig |

## Best Practices

1. **Use `needs` for job dependencies** - Enables directed acyclic graph (DAG) execution
2. **Set appropriate `retry` policies** - Handle transient failures gracefully
3. **Use `interruptible: true`** - Allow newer pipelines to cancel outdated ones
4. **Cache dependencies** - Use `cache:key:files` for deterministic caching
5. **Limit artifact retention** - Use `expire_in` to manage storage
6. **Use rules over `only/except`** - More flexible and maintainable

## Troubleshooting

### Common Issues

**Matrix jobs not running in parallel:**
- Check runner availability and concurrency settings
- Verify `parallel:matrix` syntax

**Snyk scan failing:**
- Ensure `SNYK_TOKEN` is set
- Check organization ID matches your Snyk account

**Component not found:**
- Verify component path and version
- Ensure component project is accessible

## Contributing

To add a new component:

1. Create YAML in `.gitlab/components/`
2. Define `spec:inputs` for configurable options
3. Document in this README
4. Test in a feature branch before merging
