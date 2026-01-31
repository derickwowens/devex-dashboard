# Error Handling SDK

The `@federated/error-handling` package provides centralized error capture, normalization, and routing.

## Quick Start

```typescript
import { sdk } from '@federated/facade';

try {
  await riskyOperation();
} catch (err) {
  sdk.errors()
    .capture(err)
    .withContext({ userId: user.id })
    .withSeverity('error')
    .send();
}
```

## Structured Error Format

All errors follow the [Structured Logging Standard](../standards/structured-logging.md):

```
[ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
```

### Example

```
AUTH-00142: Token refresh failed: Platform Auth: auth-team@company.com: #auth-incidents
```

## Fluent API

```typescript
sdk.errors()
  .capture(error)                    // Capture the error
  .withErrorId('AUTH-00142')         // Assign error ID
  .withSdk('@federated/auth')        // Source SDK
  .withSeverity('error')             // Severity level
  .withOwnership({                   // Ownership for routing
    team: 'Platform Auth',
    email: 'auth-team@company.com',
    incidentGroup: '#auth-incidents'
  })
  .withContext({                     // Additional context
    userId: user.id,
    operation: 'tokenRefresh'
  })
  .send();                           // Send to error store
```

## Severity Levels

| Level | Description |
|-------|-------------|
| `debug` | Development debugging |
| `info` | Informational messages |
| `warning` | Potential issues |
| `error` | Recoverable errors |
| `critical` | System failures |

## Error Store

Errors are stored in the centralized error store and can be queried:

```typescript
const recentErrors = sdk.errors()
  .query()
  .severity('error')
  .since(new Date(Date.now() - 3600000))
  .execute();
```
