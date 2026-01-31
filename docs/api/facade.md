# Facade API Reference

The `@federated/facade` package is the main entry point for the Ecosystem SDK.

## Installation

```bash
npm install @federated/facade
```

## Import

```typescript
import { sdk, createSDK } from '@federated/facade';
```

## Initialization

```typescript
await sdk.initialize({
  environment: 'production',
  debug: false
});
```

## API Reference

### `sdk.auth()`

Returns the authentication fluent API.

```typescript
// Login
await sdk.auth().loginWithCode(code).execute();

// Check permission
await sdk.auth().hasPermission('resource', 'action');

// On-Behalf-Of
await sdk.auth().onBehalfOf(token).forScopes(['api://.default']).execute();
```

### `sdk.errors()`

Returns the error handling fluent API.

```typescript
sdk.errors()
  .capture(error)
  .withContext({ userId })
  .withSeverity('error')
  .send();
```

### `sdk.telemetry()`

Returns the telemetry fluent API.

```typescript
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .send();
```

### `sdk.ui()`

Returns the UI configuration fluent API.

```typescript
sdk.ui()
  .component('button')
  .variant('primary')
  .getConfig();
```

### `sdk.pipelines()`

Returns the pipelines fluent API.

```typescript
// List pipelines
await sdk.pipelines().list().status('running').execute();

// Trigger pipeline
await sdk.pipelines().trigger('project', 'branch').execute();
```

### `sdk.contacts()`

Returns the contacts fluent API.

```typescript
await sdk.contacts().search('john').inOrg('engineering').execute();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `environment` | string | `'development'` | Environment name |
| `debug` | boolean | `false` | Enable debug logging |
| `apiBaseUrl` | string | - | Override API base URL |

## Creating Multiple Instances

```typescript
const customSdk = createSDK({
  environment: 'staging',
  apiBaseUrl: 'https://staging-api.example.com'
});
```
