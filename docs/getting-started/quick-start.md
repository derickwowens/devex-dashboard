# Quick Start Guide

Get up and running with the Federated DevEx Platform in minutes.

## Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- GitHub account with appropriate access

## Installation

```bash
# Install the main SDK
npm install @federated/facade

# Or install individual packages
npm install @federated/auth @federated/error-handling @federated/telemetry
```

## Basic Usage

### Initialize the SDK

```typescript
import { sdk, createSDK } from '@federated/facade';

// Use the default singleton
await sdk.initialize({
  environment: 'development',
  debug: true
});

// Or create a custom instance
const customSdk = createSDK({
  environment: 'production',
  apiBaseUrl: 'https://api.company.com'
});
```

### Error Handling

```typescript
import { sdk } from '@federated/facade';

try {
  await riskyOperation();
} catch (err) {
  sdk.errors()
    .capture(err)
    .withContext({ 
      operation: 'riskyOperation',
      userId: user.id 
    })
    .withSeverity('error')
    .send();
}
```

### Authentication

```typescript
import { sdk } from '@federated/facade';

// Login with authorization code
const result = await sdk.auth()
  .loginWithCode(authCode)
  .execute();

// Check permissions
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  // Proceed with operation
}
```

### Telemetry

```typescript
import { sdk } from '@federated/facade';

// Record a metric
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .tags({ endpoint: '/users' })
  .send();
```

## Next Steps

- [Full SDK Reference](../sdk/overview.md)
- [Authentication Guide](../sdk/authentication.md)
- [Error Handling Best Practices](../sdk/error-handling.md)
- [Structured Logging Standard](../standards/structured-logging.md)
