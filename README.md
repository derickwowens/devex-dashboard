# Federated DevEx Platform

A demonstration project showcasing modern developer experience patterns including fluent facade APIs, centralized error handling, and AI-forward architecture.

## 🎯 Project Vision

This project demonstrates how to build a **federated developer experience platform** that:

1. **Shields specialized engineers** (game devs, actuaries, etc.) from DevOps complexity
2. **Provides a fluent facade** — a thin orchestration layer for consistent API consumption
3. **Centralizes cross-cutting concerns** — error handling, UI configuration, telemetry
4. **Enables AI agent compatibility** — minimal boilerplate, discoverable APIs
5. **Implements version discipline** — cascading version updates across the SDK ecosystem

## 📁 Project Structure

```
federated-devex-platform/
├── packages/
│   ├── core/              # Parent SDK with plugin system
│   ├── error-handling/    # Centralized error capture and reporting
│   ├── ui-config/         # UI component configuration registry
│   ├── telemetry/         # Metrics, tracing, and observability
│   └── facade/            # Fluent facade — the "thin layer"
├── apps/
│   └── dashboard/         # DevEx dashboard UI (React + Vite)
├── docs/
│   ├── architecture-patterns.md    # 3 recommended code patterns
│   └── infrastructure-patterns.md  # 3 recommended AWS patterns
├── copilot-instructions.md         # AI agent guidance
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone and navigate to project
cd federated-devex-platform

# Install dependencies
npm install

# Start the dashboard
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 💡 Core Concepts

### Fluent Facade Pattern

The SDK provides a chainable, discoverable API that abstracts complexity:

```typescript
import { sdk } from '@federated/facade';

// Error handling
sdk.errors()
  .capture(err)
  .withContext({ userId: '123' })
  .inComponent('PlayerService')
  .withSeverity('error')
  .send();

// UI configuration
const buttonConfig = sdk.ui()
  .component('button')
  .variant('primary')
  .size('lg')
  .getConfig();

// Telemetry
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .send();

// Pipelines
const running = sdk.pipelines()
  .list()
  .status('running')
  .execute();

// Contacts
const engineers = sdk.contacts()
  .search('engineer')
  .inOrg('Engineering')
  .execute();
```

### Centralized Error Handling

One API to rule them all — normalized, ecosystem-wide error capture:

```typescript
try {
  await riskyOperation();
} catch (err) {
  sdk.errors()
    .capture(err)
    .withContext({ operation: 'riskyOperation', userId })
    .withSeverity('error')
    .send();
}
```

### Version Discipline

Child SDK version bumps cascade to the parent SDK:

- Child **major** bump → Parent **minor** bump
- Child **minor** bump → Parent **patch** bump
- Child **patch** bump → Parent **patch** bump

This ensures consumers always know when ecosystem changes occur.

## 🖥️ Dashboard Features

The DevEx Dashboard provides:

- **Pipeline Monitoring** — View and manage CI/CD pipelines
- **Error Tracking** — Centralized error monitoring with context
- **Contact Directory** — Address book for organizational contacts
- **Code Review** — AI-powered code review suggestions (RAG paradigm)
- **SDK Playground** — Interactive examples of the fluent facade API

## 📚 Documentation

- [`copilot-instructions.md`](./copilot-instructions.md) — AI agent guidance and coding standards
- [`docs/architecture-patterns.md`](./docs/architecture-patterns.md) — Recommended code patterns
- [`docs/infrastructure-patterns.md`](./docs/infrastructure-patterns.md) — Recommended AWS patterns

## 🏗️ Architecture Highlights

### For PlayStation / Game Development

- **Game Engine Integration** — Expose systems in a simple, federated way
- **Asset Pipeline Management** — Track and manage build pipelines
- **Telemetry for Performance** — Track frame times, memory usage, etc.
- **Error Handling for Crashes** — Centralized crash reporting with context

### For Vantaca / Property Management

- **HOA Workflow Automation** — Expose complex workflows through simple APIs
- **Billing Integration** — Centralized error handling for payment flows
- **Contact Management** — Address book for property managers and vendors
- **Audit Trail** — Telemetry for compliance and debugging

## 🤖 AI-Forward Design

The SDK is designed for AI agent consumption:

1. **Minimal boilerplate** — Less code for agents to generate
2. **Discoverable APIs** — Fluent interface enables autocomplete
3. **Rich TypeScript types** — Agents can understand the API surface
4. **Deterministic functions** — Predictable inputs and outputs

## 🛠️ Development

### Building Packages

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## 📄 License

MIT

---

*Built as an interview demonstration project showcasing modern DevEx patterns.*
