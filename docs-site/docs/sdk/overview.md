# SDK Overview

The Federated DevEx Platform SDK provides a unified, fluent API for all cross-cutting concerns in your applications.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    @federated/facade                         │
│         (Fluent API - The "Thin Layer")                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────┬───────────┼───────────┬─────────┐
        ▼         ▼           ▼           ▼         ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  Auth   │ │ Errors  │ │   UI    │ │Telemetry│ │  Core   │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Package Summary

### @federated/facade

The main entry point. Provides the fluent API that orchestrates all other packages.

```typescript
import { sdk } from '@federated/facade';

sdk.auth()       // Authentication
sdk.errors()     // Error handling
sdk.ui()         // UI configuration
sdk.telemetry()  // Metrics and tracing
sdk.pipelines()  // CI/CD pipelines
sdk.contacts()   // Address book
```

### @federated/auth

Centralized authentication with Microsoft Entra On-Behalf-Of flow.

- OAuth2 authorization code flow
- Client credentials for service-to-service
- On-Behalf-Of for token exchange
- Role-based access control from S3/DynamoDB

### @federated/error-handling

Unified error capture and reporting.

- Fluent API for error capture
- Context enrichment
- Severity levels
- Automatic dashboard integration

### @federated/ui-config

Centralized UI component configuration.

- Component registry
- Theme management
- Accessibility attributes
- Design token management

### @federated/telemetry

Metrics, tracing, and observability.

- Counter, gauge, histogram, timer metrics
- Distributed tracing with spans
- Automatic timing helpers
- Dashboard integration

### @federated/core

The foundation for the plugin system.

- Plugin registration
- Version management
- Configuration handling
- Dependency resolution

## Design Principles

### Fluent API

All APIs are chainable and discoverable:

```typescript
// Chain methods naturally
sdk.errors()
  .capture(err)
  .withContext({ userId })
  .inComponent('Service')
  .withSeverity('error')
  .send();
```

### Type Safety

Full TypeScript support with rich types:

```typescript
// Autocomplete and type checking
const config: ComponentConfig = sdk.ui()
  .component('button')
  .variant('primary')  // Type-checked
  .size('lg')          // Type-checked
  .getConfig();
```

### AI-Forward

Designed for both humans and AI agents:

- Minimal boilerplate
- Predictable patterns
- Rich JSDoc comments
- Discoverable API surface

## Version Compatibility

| Package | Current Version | Min Node |
|---------|-----------------|----------|
| @federated/facade | 1.0.0 | 18.0.0 |
| @federated/auth | 1.0.0 | 18.0.0 |
| @federated/error-handling | 1.0.0 | 18.0.0 |
| @federated/ui-config | 1.0.0 | 18.0.0 |
| @federated/telemetry | 1.0.0 | 18.0.0 |
| @federated/core | 1.0.0 | 18.0.0 |
