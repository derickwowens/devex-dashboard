# Federated DevEx Platform

> **Focus on what you do best. We handle the rest.**

Welcome to the Federated DevEx Platform documentation. This platform provides centralized, federated APIs for cross-cutting concerns so engineers can focus on their expertise—not infrastructure boilerplate.

## Why This Platform?

| Problem | Our Solution |
|---------|--------------|
| Every team implements their own auth | Centralized Microsoft Entra OBO with role store |
| Error handling is fragmented | Unified error capture with fluent API |
| UI components are inconsistent | Centralized UI configuration registry |
| Observability is scattered | Federated telemetry with unified metrics |
| CI/CD configs are copy-pasted | Parameterized build and environment scripts |
| Documentation drifts from code | Documentation as code with auto-updates |

## Quick Start

```typescript
import { sdk } from '@federated/facade';

// Authenticate
await sdk.auth().loginWithCode(authCode).execute();

// Capture errors with context
sdk.errors()
  .capture(err)
  .withContext({ userId, operation: 'checkout' })
  .send();

// Track metrics
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .send();
```

## Core Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@federated/facade` | Fluent facade - the thin orchestration layer | {{ versions.facade }} |
| `@federated/auth` | Microsoft Entra OBO + role-based access | {{ versions.auth }} |
| `@federated/error-handling` | Centralized error capture | {{ versions.error_handling }} |
| `@federated/ui-config` | UI component configuration | {{ versions.ui_config }} |
| `@federated/telemetry` | Metrics, tracing, observability | {{ versions.telemetry }} |
| `@federated/core` | Core SDK with plugin system | {{ versions.core }} |

## Developer-First Philosophy

1. **Developers are customers** — Their time is valuable
2. **Expertise over boilerplate** — Focus on what you're good at
3. **Fluent over friction** — APIs should be discoverable
4. **AI-forward design** — Works for humans and AI agents

## Documentation Updates

This documentation is automatically updated when:

- Package versions change
- API signatures are modified
- New features are added
- Architecture decisions are recorded

Last updated: {{ build.timestamp }}
Build: {{ build.id }}
