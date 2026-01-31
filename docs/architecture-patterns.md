# Architecture Patterns

This document maintains 3 recommended code architecture patterns for the Federated DevEx Platform. Updated as the system evolves.

---

## Pattern 1: Fluent Facade with Plugin Architecture

**Status**: Recommended (Primary Pattern)

### Description
A central facade class that exposes a fluent API, with functionality provided by pluggable child SDKs. Each plugin registers itself with the core, and the facade delegates to the appropriate plugin.

### Structure
```
┌─────────────────────────────────────────────────────┐
│                   Consumer Code                      │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              Fluent Facade (Versioned)              │
│  sdk.errors()  sdk.ui()  sdk.telemetry()           │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Error    │  │    UI     │  │ Telemetry │
│  Plugin   │  │  Plugin   │  │  Plugin   │
└───────────┘  └───────────┘  └───────────┘
```

### Implementation
```typescript
// Core SDK with plugin registration
class FederatedSDK {
  private plugins: Map<string, Plugin> = new Map();

  register<T extends Plugin>(name: string, plugin: T): this {
    this.plugins.set(name, plugin);
    return this;
  }

  errors(): ErrorFluent {
    return this.getPlugin<ErrorPlugin>('errors').fluent();
  }

  ui(): UIFluent {
    return this.getPlugin<UIPlugin>('ui').fluent();
  }
}
```

### When to Use
- Building ecosystem-wide SDKs
- When you need consistent API surface across multiple domains
- When AI agents need to discover and use APIs

### Trade-offs
- Highly discoverable API
- Easy to extend with new plugins
- Versioning at facade level protects consumers
- Slight indirection overhead
- Requires discipline to keep facade updated

---

## Pattern 2: Command Query Responsibility Segregation (CQRS) for Services

**Status**: Recommended (For Complex Domains)

### Description
Separate read (query) and write (command) operations into distinct models. Commands mutate state and return minimal data; queries read state and return rich projections.

### Structure
```
┌─────────────────────────────────────────────────────┐
│                    Facade Layer                      │
└──────────┬─────────────────────────┬────────────────┘
           │                         │
           ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Command Handler   │   │   Query Handler     │
│   (Write Model)     │   │   (Read Model)      │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│   Event Store /     │   │   Read Database /   │
│   Write Database    │   │   Projections       │
└─────────────────────┘   └─────────────────────┘
```

### Implementation
```typescript
// Command
interface CreatePipelineCommand {
  type: 'CreatePipeline';
  payload: { name: string; config: PipelineConfig };
}

// Query
interface GetPipelineStatusQuery {
  type: 'GetPipelineStatus';
  pipelineId: string;
}

// Handlers
class PipelineCommandHandler {
  async execute(cmd: CreatePipelineCommand): Promise<{ id: string }> {
    // Validate, persist, emit events
  }
}

class PipelineQueryHandler {
  async execute(query: GetPipelineStatusQuery): Promise<PipelineStatus> {
    // Read from optimized projection
  }
}
```

### When to Use
- Complex domains with different read/write patterns
- When read and write scalability requirements differ
- Event-sourced systems

### Trade-offs
- Optimized read and write paths
- Clear separation of concerns
- Scales independently
- Increased complexity
- Eventual consistency considerations

---

## Pattern 3: Middleware Pipeline for Cross-Cutting Concerns

**Status**: Recommended (For Request Processing)

### Description
A composable pipeline where each middleware can inspect, modify, or short-circuit requests. Used for error handling, logging, authentication, and telemetry.

### Structure
```
Request → [Auth] → [Logging] → [Validation] → [Handler] → [Logging] → Response
              │         │            │                          │
              └─────────┴────────────┴──────────────────────────┘
                              Middleware Chain
```

### Implementation
```typescript
type Middleware<T> = (
  context: T,
  next: () => Promise<void>
) => Promise<void>;

class Pipeline<T> {
  private middlewares: Middleware<T>[] = [];

  use(middleware: Middleware<T>): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(context: T): Promise<void> {
    const runner = async (index: number): Promise<void> => {
      if (index < this.middlewares.length) {
        await this.middlewares[index](context, () => runner(index + 1));
      }
    };
    await runner(0);
  }
}

// Usage
const pipeline = new Pipeline<RequestContext>()
  .use(authMiddleware)
  .use(loggingMiddleware)
  .use(errorHandlingMiddleware)
  .use(handlerMiddleware);
```

### When to Use
- HTTP request processing
- CLI command execution
- Any sequential processing with cross-cutting concerns

### Trade-offs
- Highly composable
- Easy to add/remove concerns
- Testable in isolation
- Order matters — can be error-prone
- Debugging can be tricky with deep chains

---

## Pattern Comparison Matrix

| Pattern | Complexity | Scalability | AI-Friendliness | Use Case |
|---------|------------|-------------|-----------------|----------|
| Fluent Facade | Low | Medium | Excellent | SDK/API surface |
| CQRS | High | High | Good | Complex domains |
| Middleware Pipeline | Medium | Medium | Very Good | Request processing |

---

*Last updated: 2026-01-31*
