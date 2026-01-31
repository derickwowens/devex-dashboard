# Code Style Guide

Standard code style for the Ecosystem platform.

## TypeScript

### Strict Mode

All TypeScript projects must use strict mode:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Explicit Return Types

All public functions must have explicit return types:

```typescript
// Good
function getUser(id: string): Promise<User> {
  return userService.find(id);
}

// Bad
function getUser(id: string) {
  return userService.find(id);
}
```

### Interface vs Type

- Use `interface` for object shapes
- Use `type` for unions/intersections

```typescript
// Object shapes
interface User {
  id: string;
  name: string;
}

// Unions
type Status = 'active' | 'inactive' | 'pending';
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `error-handler.ts` |
| Classes | PascalCase | `ErrorHandler` |
| Interfaces | PascalCase | `IErrorContext` |
| Functions | camelCase | `captureError` |
| Variables | camelCase | `errorContext` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |

## Error Handling

Always use the SDK error handling:

```typescript
// Good
sdk.errors().capture(err).withContext({ userId }).send();

// Bad
console.log(error);
```

## Logging

Never use `console.log` directly:

```typescript
// Good
sdk.telemetry().log('info', 'User logged in', { userId });

// Bad
console.log('User logged in');
```

## Anti-Patterns

| Don't | Do |
|----------|-------|
| `console.log(error)` | `sdk.errors().capture(error).send()` |
| `fetch('/api/...')` directly | Use typed service clients |
| Inline error handling | Use centralized SDK |
| Hardcoded UI styles | Use UI config registry |
| Untyped API responses | Define interfaces |
| Custom auth logic | Use `sdk.auth()` |
