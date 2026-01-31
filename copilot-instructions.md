# Copilot Instructions — The Ecosystem Platform

This document provides guidance for AI coding agents working within this ecosystem. Follow these principles to maintain consistency, quality, and architectural integrity.

---

## The Ecosystem Philosophy

> **One platform. One API. Zero friction.**

The Ecosystem is a unified developer platform that encapsulates everything an engineer needs. Our goal is to **reduce friction** between engineers and their tools, enabling **fast onboarding** and a **centralized place** to handle all cross-cutting concerns.

### Why "Ecosystem"?

We don't just provide tools — we provide a **complete environment** where engineers can thrive. Authentication, error handling, telemetry, pipelines, UI configuration — all accessible through a single, fluent API.

### Core Beliefs

1. **Reduce Friction** — Every interaction with the platform should feel natural. If an engineer has to think about infrastructure, we've failed.

2. **Fast Onboarding** — New engineers should be productive in under 5 minutes. The Ecosystem API is the central place to handle everything, so there's only one thing to learn.

3. **Centralized Concerns** — Auth, errors, telemetry are solved once, used everywhere. No team should ever implement their own error handling or auth flow.

4. **Fluent Over Friction** — APIs should be discoverable and chainable. `sdk.errors().capture(err).send()` reads like English.

5. **AI-Forward Design** — Our APIs are designed for both humans and AI agents. Minimal boilerplate means better AI code generation.

6. **Documentation as Code** — Documentation is version-controlled, auto-updated, and linked to builds. Stale docs are a bug.

### What This Means in Practice

| Instead of... | We provide... |
|---------------|---------------|
| Each team implementing auth | Centralized Entra OBO with role store |
| Scattered error handling | Unified error capture via fluent API |
| Copy-pasted build scripts | Parameterized, tested scripts |
| Outdated documentation | Auto-generated, build-linked docs |
| Manual UI consistency | Centralized UI configuration registry |

---

## Core Engineering Principles

### 1. Fluent Facade First
- **All external-facing code must go through the fluent facade layer**
- Never expose raw service implementations to consumers
- The facade provides a chainable, discoverable API that abstracts complexity
- Example: `sdk.errors().capture(err).withContext({ userId }).send()`

### 2. Deterministic Over Dynamic
- Prefer explicit, deterministic function signatures over magic/reflection
- Every function should have predictable inputs and outputs
- Avoid runtime type inference where compile-time types suffice
- This enables better AI agent comprehension and tooling support

### 3. Centralized Cross-Cutting Concerns
- **Error Handling**: Use `@federated/error-handling` — never implement custom error logic
- **UI Components**: Use `@federated/ui-config` for component configurations
- **Logging**: Use the unified logging facade — never use `console.log` directly
- **Telemetry**: All metrics flow through the centralized telemetry API
- **Authentication**: Use `@federated/auth` — never implement custom auth flows

### 4. Version Discipline
- Child SDK version bumps trigger parent SDK version increments
- Use semantic versioning strictly: MAJOR.MINOR.PATCH
- Breaking changes require MAJOR version bump and migration guide
- The facade layer is versioned independently to allow graceful deprecation

### 5. AI-Forward API Design
- Minimize boilerplate required to accomplish tasks
- Provide rich TypeScript types for autocomplete and agent comprehension
- Include JSDoc comments with examples on all public APIs
- Design for discoverability: agents should be able to explore the API surface

---

## File Organization Standards

```
packages/
├── core/                 # Parent SDK — orchestrates all child SDKs
├── auth/                 # Centralized auth with Microsoft Entra OBO
├── error-handling/       # Centralized error capture and normalization
├── ui-config/            # UI component configuration registry
├── telemetry/            # Metrics, tracing, and observability
└── facade/               # Fluent facade — the "thin layer"

apps/
└── dashboard/            # DevEx dashboard UI

scripts/
├── build.sh              # Parameterized build script
├── env.sh                # Environment start/stop/restart
└── install.sh            # Initial setup script
```

---

## Code Style Requirements

### TypeScript
- Strict mode enabled (`"strict": true`)
- Explicit return types on all public functions
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer `readonly` properties where mutation is not needed

### Naming Conventions
- **Files**: kebab-case (`error-handler.ts`)
- **Classes/Interfaces**: PascalCase (`ErrorHandler`, `IErrorContext`)
- **Functions/Variables**: camelCase (`captureError`, `errorContext`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Error Handling Pattern
```typescript
import { errors } from '@federated/facade';

try {
  await riskyOperation();
} catch (err) {
  errors()
    .capture(err)
    .withContext({ operation: 'riskyOperation', userId })
    .withSeverity('error')
    .send();
}
```

### UI Configuration Pattern
```typescript
import { ui } from '@federated/facade';

const buttonConfig = ui()
  .component('button')
  .variant('primary')
  .size('medium')
  .getConfig();
```

### Authentication Pattern (Microsoft Entra OBO)
```typescript
import { sdk } from '@federated/facade';

// Login with authorization code
const result = await sdk.auth()
  .loginWithCode(authCode)
  .execute();

// On-Behalf-Of flow for downstream services
const oboResult = await sdk.auth()
  .onBehalfOf(userToken)
  .forScopes(['api://downstream/.default'])
  .execute();

// Check permissions before operations
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  await sdk.pipelines().trigger('my-project', 'main');
}

// Client credentials for service-to-service
const appResult = await sdk.auth()
  .clientCredentials()
  .execute();
```

### Authentication Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Entra     │────▶│  Role Store │
│  (User/App) │     │  (Azure AD) │     │  (S3/Dynamo)│
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────────────────────┐
                    │     Federated Token         │
                    │  (Entra claims + Roles)     │
                    └─────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────┐
                    │   Downstream Services       │
                    │   (Use federated token)     │
                    └─────────────────────────────┘
```

---

## Architecture Decision Records

When making architectural decisions, document them in `/docs/architecture/adr/` using this format:
1. **Context**: What is the situation?
2. **Decision**: What did we decide?
3. **Consequences**: What are the trade-offs?

---

## Documentation Standards (MkDocs)

**Documentation is code.** All documentation lives in `/docs/` as Markdown files and is automatically built into a searchable site using MkDocs.

### Documentation Structure

```
docs/
├── mkdocs.yml                    # MkDocs configuration
├── index.md                      # Documentation home
├── requirements.txt              # Python dependencies for MkDocs
├── getting-started/
│   ├── quick-start.md
│   └── installation.md
├── sdk/
│   ├── overview.md
│   ├── error-handling.md
│   ├── authentication.md
│   └── telemetry.md
├── standards/
│   ├── structured-logging.md     # Error format standard
│   └── code-style.md
├── architecture/
│   ├── patterns.md
│   ├── infrastructure.md
│   └── adrs/
└── api/
    ├── facade.md
    └── errors.md
```

### Documentation Update Rules

!!! critical "Auto-Update Requirement"
    **When you modify SDK code, you MUST update the corresponding documentation.**

| When you... | Update these docs... |
|-------------|---------------------|
| Add a new public API | `/docs/api/` + `/docs/sdk/` |
| Change error handling | `/docs/standards/structured-logging.md` |
| Modify auth flows | `/docs/sdk/authentication.md` |
| Add architecture patterns | `/docs/architecture/patterns.md` |
| Make breaking changes | Create ADR in `/docs/architecture/adr/` |

### Documentation Commands

```bash
# Serve docs locally (http://localhost:8000)
./scripts/docs.sh serve

# Build static site
./scripts/docs.sh build

# Deploy to GitHub Pages
./scripts/docs.sh deploy
```

### Markdown Extensions

MkDocs Material supports these extensions—use them:

```markdown
!!! tip "Title"
    Tip content here

!!! warning "Important"
    Warning content here

```typescript
// Code blocks with syntax highlighting
sdk.errors().capture(err).send();
```

| Tables | Are | Supported |
|--------|-----|-----------|
| Use    | them| liberally |
```

### Documentation Quality Checklist

Before committing documentation changes:

- [ ] All code examples are tested and working
- [ ] Links to other docs are valid
- [ ] New pages are added to `mkdocs.yml` nav
- [ ] Tables are properly formatted
- [ ] Admonitions (tips, warnings) are used appropriately

---

## Testing Requirements

- Unit tests for all public API functions
- Integration tests for facade → service interactions
- E2E tests for critical dashboard workflows
- Minimum 80% code coverage on SDK packages

---

## When Generating Code

1. **Check existing patterns first** — search the codebase for similar implementations
2. **Use the facade** — never bypass it for convenience
3. **Add types** — no `any` types without explicit justification
4. **Include tests** — every new function needs a corresponding test
5. **Update docs** — if you add a public API, document it

---

## Architecture Pattern Files

Maintain these files with current recommendations:
- `/docs/architecture-patterns.md` — 3 suggested code architecture patterns
- `/docs/infrastructure-patterns.md` — 3 suggested AWS infrastructure patterns

These should be updated as the system evolves.

---

## Quick Reference: Facade API

```typescript
import { sdk } from '@federated/facade';

// Error handling
sdk.errors().capture(err).withContext({}).send();

// UI configuration
sdk.ui().component('button').variant('primary').getConfig();

// Telemetry
sdk.telemetry().metric('api.latency').value(150).unit('ms').send();

// Pipeline operations (for dashboard)
sdk.pipelines().list().filter({ status: 'running' }).execute();

// Contacts (address book)
sdk.contacts().search('john').inOrg('engineering').execute();

// Authentication
await sdk.auth().loginWithCode(code).execute();
sdk.auth().hasPermission('resource', 'action');
```

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| `console.log(error)` | `sdk.errors().capture(error).send()` |
| `fetch('/api/...')` directly | Use typed service clients via facade |
| Inline error handling logic | Use centralized error handling SDK |
| Hardcoded UI styles | Use UI config registry |
| Untyped API responses | Define interfaces for all responses |
| Custom auth logic | Use `sdk.auth()` with Entra OBO |
| Hardcoded roles/permissions | Use centralized role store |

---

## Build & Environment Scripts

Use the provided scripts instead of custom build logic:

```bash
# Build all packages
./scripts/build.sh --all --clean

# Build specific package
./scripts/build.sh --package auth

# Start development environment
./scripts/env.sh start

# Restart services
./scripts/env.sh restart --service dashboard

# Check status
./scripts/env.sh status
```

---

*This document is the source of truth for AI agents working in this codebase. When in doubt, follow these guidelines.*
