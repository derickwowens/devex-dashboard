# SDK Overview

The Federated DevEx Platform SDK provides a unified interface for common developer concerns including error handling, authentication, telemetry, and UI configuration.

## Role-Based Fine-Grain Security

**SDK functionality is dynamically controlled based on user profiles.** When a user authenticates, the Policy Engine evaluates their roles and permissions, then enables only the SDK capabilities they're authorized to use.

```typescript
// After login, SDK capabilities are automatically scoped to user's permissions
const user = await sdk.auth().getCurrentUser();
console.log(user.sdkCapabilities);
// ['auth', 'errors:read', 'pipelines:read', 'telemetry:write']

// Methods outside the user's capabilities will throw PermissionDenied
```

This ensures:
- **Principle of Least Privilege**: Users only access what they need
- **Dynamic Feature Access**: Dashboard UI adapts to user's permissions
- **Audit Compliance**: All capability checks are logged

See [Fine-Grain Security Policy](./fine-grain-security.md) for full documentation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @federated/facade                         │
│                   (Fluent API Layer)                         │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│    auth     │   errors    │  telemetry  │  ui-config  │ ... │
│  (@fed/auth)│(@fed/error) │  (@fed/tel) │  (@fed/ui)  │     │
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
```

## Package Overview

| Package | Description | Import |
|---------|-------------|--------|
| `@federated/facade` | Main SDK entry point | `import { sdk } from '@federated/facade'` |
| `@federated/auth` | Authentication with Entra OBO | `sdk.auth()` |
| `@federated/error-handling` | Centralized error capture | `sdk.errors()` |
| `@federated/telemetry` | Metrics and tracing | `sdk.telemetry()` |
| `@federated/ui-config` | UI component configuration | `sdk.ui()` |

## Quick Reference

```typescript
import { sdk } from '@federated/facade';

// Initialize
await sdk.initialize({ environment: 'production' });

// Error handling
sdk.errors().capture(err).withContext({}).send();

// Authentication
await sdk.auth().loginWithCode(code).execute();

// Telemetry
sdk.telemetry().metric('latency').value(150).send();

// UI configuration
sdk.ui().component('button').variant('primary').getConfig();

// Pipeline operations
sdk.pipelines().list().filter({ status: 'running' }).execute();
```

## Design Principles

### Fluent API

All SDK methods use a fluent (chainable) API design:

```typescript
// Instead of passing many arguments...
captureError(err, context, severity, metadata);

// We use chainable methods...
sdk.errors()
  .capture(err)
  .withContext(context)
  .withSeverity(severity)
  .withMetadata(metadata)
  .send();
```

### Type Safety

All APIs are fully typed with TypeScript for excellent IDE support and compile-time safety.

### Centralized Concerns

Cross-cutting concerns like logging, auth, and error handling are centralized—never implement custom logic for these.
