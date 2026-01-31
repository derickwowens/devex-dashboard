# Architecture Patterns

Recommended architecture patterns for the Ecosystem platform.

## 1. Fluent Facade Pattern

All external-facing code goes through the fluent facade layer:

```typescript
import { sdk } from '@federated/facade';

// Instead of importing individual services
sdk.errors().capture(err).send();
sdk.auth().loginWithCode(code).execute();
sdk.telemetry().metric('latency').value(100).send();
```

### Benefits

- **Discoverability** — Single entry point to explore
- **Consistency** — Chainable, predictable API
- **Abstraction** — Implementation details hidden
- **Versioning** — Facade versioned independently

## 2. Plugin Architecture

SDKs are implemented as plugins that register with the core:

```typescript
interface Plugin {
  name: string;
  version: string;
  initialize(core: CoreSDK): Promise<void>;
  destroy(): Promise<void>;
}
```

### Plugin Lifecycle

1. **Registration** — Plugin registers with core
2. **Initialization** — Core calls `initialize()`
3. **Operation** — Plugin provides fluent API
4. **Destruction** — Core calls `destroy()` on shutdown

## 3. Centralized Cross-Cutting Concerns

Never implement these yourself:

| Concern | SDK | Usage |
|---------|-----|-------|
| Authentication | `@federated/auth` | `sdk.auth()` |
| Error Handling | `@federated/error-handling` | `sdk.errors()` |
| Telemetry | `@federated/telemetry` | `sdk.telemetry()` |
| UI Config | `@federated/ui-config` | `sdk.ui()` |

## 4. Event-Driven Communication

Components communicate via events, not direct calls:

```typescript
// Publish event
sdk.events().publish('user.created', { userId: '123' });

// Subscribe to events
sdk.events().subscribe('user.created', async (event) => {
  await sendWelcomeEmail(event.userId);
});
```

## 5. Configuration Hierarchy

Configuration flows from environment → project → runtime:

```
Environment Variables
        ↓
   Project Config
        ↓
   Runtime Config
        ↓
   Final Config
```
