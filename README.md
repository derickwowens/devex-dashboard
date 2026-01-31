# Ecosystem Developer Platform

> **One platform. One API. Zero friction.**

A unified developer platform that encapsulates everything an engineer needs — authentication, error handling, telemetry, pipelines, and more — all accessible through a single, fluent API.

## Philosophy

The Ecosystem reduces friction between engineers and their tools. No more context-switching between different libraries. No more boilerplate. No more "how do I set this up?" questions.

| Problem | Ecosystem Solution |
|---------|-------------------|
| 5 different auth libraries | `sdk.auth()` |
| Custom error handling per team | `sdk.errors()` with instant triage |
| Scattered telemetry configs | `sdk.telemetry()` |
| Manual pipeline scripts | `sdk.pipelines()` |

## Project Structure

```
ecosystem-devex-platform/
├── apps/
│   ├── dashboard/           # Ecosystem Dashboard (React + Vite + Tailwind)
│   └── chat-api/            # AI Chatbot API (Anthropic + MCP)
├── packages/
│   ├── core/                # Parent SDK with plugin system
│   ├── auth/                # Microsoft Entra authentication with OBO flow
│   ├── error-handling/      # Centralized error capture with structured logging
│   ├── telemetry/           # Metrics, tracing, and observability
│   ├── ui-config/           # UI component configuration registry
│   ├── facade/              # Fluent facade API (main entry point)
│   └── mcp-github/          # MCP server for GitHub integration
├── docs/                    # MkDocs documentation site
│   ├── getting-started/     # Quick start and installation guides
│   ├── sdk/                 # SDK reference documentation
│   ├── standards/           # Coding and logging standards
│   ├── architecture/        # Architecture patterns and ADRs
│   └── api/                 # API reference
├── scripts/
│   ├── env.sh               # Environment management (start/stop/restart)
│   ├── build.sh             # Build script
│   └── docs.sh              # Documentation server
├── mkdocs.yml               # MkDocs configuration
└── copilot-instructions.md  # AI agent guidance
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+ (for MkDocs documentation)

### Installation

```bash
# Install dependencies
npm install

# Create Python virtual environment for docs
python3 -m venv .venv
source .venv/bin/activate
pip install mkdocs mkdocs-material pymdown-extensions
```

### Start Development Environment

```bash
# Start all services (dashboard + docs)
./scripts/env.sh start

# Or start individually
./scripts/env.sh start --service dashboard  # Port 3000
./scripts/env.sh start --service docs       # Port 8000
```

**Services:**
- Dashboard: http://localhost:3000
- Documentation: http://localhost:8000

## Dashboard Features

The Ecosystem Dashboard provides:

| Tab | Description |
|-----|-------------|
| **Ecosystem Home** | Overview with quick links and API reference |
| **My Projects** | Project metadata, dependencies, and technology analysis |
| **CI/CD Pipelines** | GitHub Actions pipeline monitoring with filters |
| **Error Triage** | Centralized error tracking with structured logging |
| **Knowledge Base** | MkDocs documentation with search |
| **Team Directory** | Contact search and organizational lookup |
| **AI Code Review** | AI-powered code review suggestions |
| **API Explorer** | Interactive SDK playground |

## Fluent Facade API

Single import, everything you need:

```typescript
import { sdk } from '@federated/facade';

// Authentication (Microsoft Entra OBO)
await sdk.auth().loginWithCode(code).execute();
if (await sdk.auth().hasPermission('pipelines', 'create')) { ... }

// Error Handling with Structured Logging
sdk.errors()
  .capture(err)
  .withErrorId('AUTH-00142')
  .withOwnership({
    team: 'Platform Auth',
    email: 'auth-team@company.com',
    incidentGroup: '#auth-incidents'
  })
  .send();

// Telemetry
sdk.telemetry().metric('api.latency').value(150).unit('ms').send();

// Pipelines
await sdk.pipelines().trigger('my-project', 'main').execute();
```

## Structured Logging Standard

All errors follow a standardized format for instant triage:

```
[ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
```

**Example:**
```
AUTH-00142: Token refresh failed: Platform Auth: auth-team@company.com: #auth-incidents
```

This eliminates research time — every error contains routing information.

## SDK Packages

| Package | Description | API |
|---------|-------------|-----|
| `@federated/facade` | Main entry point | `sdk.*()` |
| `@federated/auth` | Microsoft Entra authentication | `sdk.auth()` |
| `@federated/error-handling` | Centralized error capture | `sdk.errors()` |
| `@federated/telemetry` | Metrics and tracing | `sdk.telemetry()` |
| `@federated/ui-config` | UI component configuration | `sdk.ui()` |

## Documentation

Documentation is built with MkDocs and served locally:

```bash
# Start documentation server
./scripts/docs.sh serve

# Build static site
./scripts/docs.sh build
```

**Documentation sections:**
- [Getting Started](docs/getting-started/quick-start.md)
- [SDK Reference](docs/sdk/overview.md)
- [Structured Logging Standard](docs/standards/structured-logging.md)
- [Architecture Patterns](docs/architecture/patterns.md)
- [API Reference](docs/api/facade.md)

## Environment Management

```bash
# Start all services
./scripts/env.sh start

# Stop all services
./scripts/env.sh stop

# Restart all services
./scripts/env.sh restart

# Check status
./scripts/env.sh status

# Start specific service
./scripts/env.sh start --service dashboard
./scripts/env.sh start --service docs
```

## AI Chatbot Integration

The dashboard includes an AI chatbot powered by:
- **Anthropic Claude** for natural language understanding
- **MCP (Model Context Protocol)** for GitHub integration

The chatbot can answer questions about pipelines, errors, and help navigate the ecosystem.

## Development Guidelines

See [copilot-instructions.md](./copilot-instructions.md) for:
- Ecosystem philosophy
- Code style requirements (no emojis, strict TypeScript)
- Error handling patterns
- Documentation standards
- Architecture patterns

## Version Discipline

Child SDK version bumps cascade to the parent SDK:

| Child Change | Parent Change |
|--------------|---------------|
| Major bump | Minor bump |
| Minor bump | Patch bump |
| Patch bump | Patch bump |

## License

MIT

---

**Ecosystem Developer Platform** — Reducing friction, accelerating delivery.
