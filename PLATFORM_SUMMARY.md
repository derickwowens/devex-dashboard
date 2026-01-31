# Federated Developer Experience Platform

## Executive Summary

The Federated DevEx Platform is a **unified developer experience dashboard** that provides centralized visibility into the entire software development lifecycle. It aggregates data from GitHub, security scanning tools (Snyk, CodeQL), and internal systems into a single, coherent interface that adapts dynamically to each user's role and permissions.

---

## Core Philosophy

### 1. **Federated Architecture with Centralized Experience**

The platform embraces a federated model where multiple autonomous systems (GitHub, Snyk, CI/CD pipelines, telemetry services) are unified through a **fluent facade SDK**. Rather than forcing teams to use a single monolithic tool, we provide a consistent interface layer that:

- Aggregates data from distributed sources
- Presents a unified view without sacrificing individual system autonomy
- Allows teams to continue using their preferred tools while benefiting from centralized observability

### 2. **Role-Based Fine-Grain Security Policy**

**SDK functionality is dynamically controlled based on user profiles.** This is not traditional coarse-grained RBAC—it's fine-grain policy evaluation that:

- Evaluates permissions at authentication time via a Policy Engine
- Dynamically enables/disables SDK capabilities per user
- Adapts the UI to show only what each user is authorized to access
- Follows the **Principle of Least Privilege**
- Logs all capability checks for audit compliance

```
User Login → Entra ID + Claims → Policy Engine → User Profile → Dynamic SDK Init
                                      ↓
                              ┌─────────────────┐
                              │  Permissions    │
                              │  Feature Flags  │
                              │  Resource Limits│
                              │  SDK Capabilities│
                              └─────────────────┘
```

### 3. **Fluent API Design for Discoverability**

All SDK interactions use a **fluent (chainable) API pattern**:

```typescript
sdk.errors()
  .capture(new Error('Connection timeout'))
  .withContext({ userId: 'user-123' })
  .inComponent('OAuthTokenManager')
  .withSeverity('error')
  .send();
```

This design is:
- **Discoverable**: IDE autocomplete guides developers
- **Type-safe**: Full TypeScript support with compile-time checks
- **AI-agent friendly**: Structured APIs that AI assistants can easily compose
- **Self-documenting**: Method chains read like sentences

### 4. **Structured Error Handling with Ownership**

Errors follow a standardized format that enables automatic routing:

```
[ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
```

Every error includes:
- Unique error code (e.g., `AUTH-00142`)
- Team ownership information
- Resolution steps in the error catalog
- Links to relevant documentation

This ensures errors are **triaged instantly** to the right team without manual investigation.

---

## Application Features

### Dashboard (`/`)

The central hub providing:

| Section | Purpose |
|---------|---------|
| **Stats Overview** | Active repos, pipeline success rate, error rate, active pipelines |
| **Recent Pipelines** | Expandable rows showing workflow details, commit info, duration, links to GitHub |
| **Recent Errors** | Quick view of failed builds and issues |
| **Security Scans** | Hierarchical view: Project → Branch → Scans with severity breakdown |
| **API Explorer** | Interactive code playground with copy/run functionality |

### CI/CD Pipelines (`/pipelines`)

Full pipeline visibility with:
- Real-time status (running, success, failed, pending)
- Expandable details showing workflow info, commit details, timing
- Filtering by status, repository, branch
- Direct links to GitHub Actions runs

### Error Triage (`/errors`)

Centralized error management featuring:

- **Error Code Lookup**: Search any error code to get:
  - Error message and severity
  - SDK and component that threw it
  - Resolution steps (green box)
  - Team ownership with email and Slack channel
  - Documentation links
- **Error List**: All recent errors with filtering by SDK and severity
- **Formatted Error Strings**: Copy-ready strings for ticket creation

### Security Scans (Dashboard Section)

Hierarchical security visibility:

```
📁 devex-dashboard
  └── 🌿 main
       ├── 📦 Snyk Dependencies (3 issues)
       ├── 🐛 Snyk Code SAST (17 issues)
       └── 📄 CodeQL Analysis (Clean)
```

- Aggregates Snyk and CodeQL results
- Shows severity breakdown (critical, high, medium, low)
- Links directly to GitHub Security tabs
- Collapsible hierarchy to reduce clutter

### Projects (`/projects`)

Repository analysis including:
- Language breakdown
- Dependency analysis (npm, pip, cargo, etc.)
- Framework detection
- Testing, linting, and security tool detection
- Build and infrastructure info

### Code Review (`/code-review`)

Commit analysis with:
- AI-generated code suggestions
- Metrics (lint errors, coverage, complexity, security issues)
- Commit history with expandable details

### SDK Playground (`/sdk`)

Interactive SDK exploration:
- Editable code editor
- Dynamic execution simulation
- Real-time output reflecting code changes
- Error handling with visual feedback
- Copy and run buttons

### Documentation (`/docs`)

Centralized documentation hub linking to:
- SDK documentation (overview, auth, error handling, telemetry, UI config)
- Architecture patterns and ADRs
- Standards (structured logging, code style)
- Getting started guides

---

## Technical Architecture

### Data Sources

| Source | Data Provided |
|--------|---------------|
| **GitHub API** | Repos (owned + contributed), commits, workflow runs, package.json files |
| **Snyk** | Dependency vulnerabilities, SAST code analysis |
| **CodeQL** | Static analysis results |
| **Policy Store** | Roles, permissions, feature flags, resource limits |

### GitHub Integration

The platform fetches repositories where the user:
1. Is the **owner**
2. Is a **collaborator**
3. Is an **organization member**
4. Has **authored commits** (searched via GitHub Search API, going back 1 year)

```typescript
// Combines multiple sources and deduplicates
const allRepos = mergeAndDedupe(ownedRepos, commitRepos)
```

### SDK Packages

| Package | Purpose |
|---------|---------|
| `@federated/facade` | Main entry point, fluent API layer |
| `@federated/auth` | Authentication with Entra ID OBO flow |
| `@federated/error-handling` | Structured error capture and routing |
| `@federated/telemetry` | Metrics, tracing, observability |
| `@federated/ui-config` | Consistent UI component configuration |
| `@federated/pipelines` | Pipeline operations and monitoring |
| `@federated/security` | Security scan integration |
| `@federated/chat-api` | AI chatbot integration |

### Error Catalog

Known errors are cataloged with full resolution information:

| Error Code | Component | Team |
|------------|-----------|------|
| `AUTH-00142` | OAuthTokenManager | Platform Auth |
| `SDK-00089` | GitHubService | Platform Core |
| `TEL-00023` | MetricsIngestionService | Observability |
| `UI-00017` | DashboardConfigLoader | Frontend Platform |
| `PIPE-00034` | WorkflowMonitor | DevOps |
| `SNYK-00012` | SnykIntegration | Security |
| `CHAT-00005` | ChatbotService | Platform Core |
| `AUTH-00098` | SessionManager | Platform Auth |

---

## Security Model

### Authentication Flow

```
┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌───────────┐
│   User   │───▶│  Entra ID    │───▶│  Policy Engine  │───▶│  SDK Init │
│  Login   │    │  + Claims    │    │  (Fine-Grain)   │    │ (Dynamic) │
└──────────┘    └──────────────┘    └─────────────────┘    └───────────┘
```

### Permission Format

Permissions follow `resource:action` pattern:

- `pipelines:read` - View pipelines
- `pipelines:trigger` - Start new runs
- `errors:triage` - Access error lookup
- `security:read` - View scan results
- `*` - Full access (admin)

### Feature Flags

Gradual rollouts controlled via feature flags:
- `sdk-playground` - Access to SDK Playground
- `error-triage` - Access to Error Triage features
- `security-scans` - Access to Security Scans section

---

## Design Principles

1. **Don't Reinvent the Wheel**: Use existing tools (GitHub, Snyk, Entra ID) and unify them
2. **Progressive Disclosure**: Show summary first, details on demand (expandable rows)
3. **Reduce Clutter**: Hierarchical views (Project → Branch → Scans) instead of flat lists
4. **Self-Service**: Developers can look up errors and find resolution steps without opening tickets
5. **Audit Everything**: All permission checks logged for compliance
6. **Real Data**: Dashboard shows real GitHub data, not mocks (where connected)
7. **Graceful Degradation**: If one data source fails, others still work

---

## File Structure

```
apps/dashboard/
├── src/
│   ├── components/
│   │   ├── ApiExplorer.tsx      # Interactive API code playground
│   │   ├── SecurityScans.tsx    # Hierarchical security scan display
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── hooks/
│   │   └── useGitHub.ts         # GitHub data fetching hooks
│   ├── services/
│   │   └── github.ts            # GitHub API client
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Pipelines.tsx        # CI/CD pipelines
│   │   ├── Errors.tsx           # Error triage with lookup
│   │   ├── Projects.tsx         # Repository analysis
│   │   ├── CodeReview.tsx       # Commit review
│   │   ├── SDKPlayground.tsx    # Interactive SDK explorer
│   │   ├── Documentation.tsx    # Docs hub
│   │   └── Architecture.tsx     # Architecture diagrams
│   └── lib/
│       └── utils.ts             # Utility functions
docs/
├── sdk/
│   ├── overview.md              # SDK overview with RBAC section
│   ├── authentication.md        # Auth SDK docs
│   ├── fine-grain-security.md   # Fine-grain policy documentation
│   ├── error-handling.md        # Error handling patterns
│   ├── telemetry.md             # Telemetry SDK
│   └── ui-config.md             # UI configuration
├── architecture/
│   ├── patterns.md              # Architecture patterns
│   ├── adrs.md                  # Architecture Decision Records
│   └── infrastructure.md        # Infrastructure docs
└── standards/
    ├── structured-logging.md    # Logging standards
    └── code-style.md            # Code style guide
.github/
└── workflows/
    └── security.yml             # Snyk + CodeQL security scanning
```

---

## Summary

The Federated DevEx Platform embodies a philosophy of **unified experience with distributed autonomy**. It doesn't force teams into a single tool but provides a **smart aggregation layer** that:

- Shows developers what they need, when they need it
- Adapts dynamically to each user's role and permissions
- Routes errors automatically to the right team
- Provides self-service resolution through error code lookup
- Maintains security through fine-grain policy evaluation
- Integrates with existing tools rather than replacing them

The result is a developer experience that reduces context switching, accelerates incident resolution, and provides visibility across the entire software delivery lifecycle—all while respecting the principle of least privilege and maintaining full audit compliance.
