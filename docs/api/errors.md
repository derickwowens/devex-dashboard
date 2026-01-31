# Error API Reference

Complete API reference for `sdk.errors()`.

## Methods

### `capture(error)`

Capture an error for reporting.

```typescript
sdk.errors().capture(error)
```

**Parameters:**
- `error` — Error object or string

**Returns:** ErrorFluent (chainable)

---

### `withErrorId(id)`

Assign a unique error ID.

```typescript
.withErrorId('AUTH-00142')
```

**Parameters:**
- `id` — Error ID in format `SDK-XXXXX`

---

### `withSdk(name)`

Specify the source SDK.

```typescript
.withSdk('@federated/auth')
```

**Parameters:**
- `name` — SDK package name

---

### `withSeverity(level)`

Set error severity.

```typescript
.withSeverity('error')
```

**Parameters:**
- `level` — One of: `debug`, `info`, `warning`, `error`, `critical`

---

### `withOwnership(ownership)`

Set ownership for ticket routing.

```typescript
.withOwnership({
  team: 'Platform Auth',
  email: 'auth-team@company.com',
  incidentGroup: '#auth-incidents'
})
```

**Parameters:**
- `ownership.team` — Team name
- `ownership.email` — Contact email
- `ownership.incidentGroup` — Slack/Teams channel

---

### `withContext(context)`

Add contextual information.

```typescript
.withContext({
  userId: '123',
  operation: 'tokenRefresh',
  requestId: 'req-456'
})
```

---

### `send()`

Send the error report.

```typescript
.send()
```

**Returns:** Promise<void>

## Complete Example

```typescript
try {
  await authenticateUser();
} catch (err) {
  await sdk.errors()
    .capture(err)
    .withErrorId('AUTH-00142')
    .withSdk('@federated/auth')
    .withSeverity('error')
    .withOwnership({
      team: 'Platform Auth',
      email: 'auth-team@company.com',
      incidentGroup: '#auth-incidents'
    })
    .withContext({
      userId: user.id,
      operation: 'authenticate'
    })
    .send();
}
```

## Types

```typescript
interface ErrorOwnership {
  team: string;
  email: string;
  incidentGroup: string;
}

type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';
```
