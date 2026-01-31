# Quick Start

Get up and running with the Federated DevEx Platform in 5 minutes.

## 1. Import the SDK

```typescript
import { sdk } from '@federated/facade';
```

That's it. The SDK auto-initializes on first use.

## 2. Authenticate

```typescript
// For user authentication (interactive)
const result = await sdk.auth()
  .loginWithCode(authorizationCode)
  .execute();

if (result.success) {
  console.log('Authenticated as:', result.context.identity.displayName);
}

// For service-to-service (client credentials)
const appResult = await sdk.auth()
  .clientCredentials()
  .execute();
```

## 3. Handle Errors

```typescript
try {
  await someRiskyOperation();
} catch (err) {
  // Capture with full context
  await sdk.errors()
    .capture(err)
    .withContext({ userId: '123', operation: 'checkout' })
    .inComponent('PaymentService')
    .withSeverity('error')
    .send();
}
```

## 4. Track Metrics

```typescript
// Simple metric
sdk.telemetry().increment('requests.count');

// Detailed metric
sdk.telemetry()
  .metric('api.latency')
  .value(150)
  .unit('ms')
  .tags({ endpoint: '/users', method: 'GET' })
  .send();

// Time an operation
const result = await sdk.telemetry().time(
  'database.query',
  () => db.query('SELECT * FROM users')
);
```

## 5. Check Permissions

```typescript
// Before sensitive operations
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  await sdk.pipelines().trigger('my-project', 'main');
} else {
  sdk.errors()
    .capture(new Error('Permission denied'))
    .withSeverity('warning')
    .send();
}
```

## 6. Use UI Configurations

```typescript
// Get consistent component configs
const buttonConfig = sdk.ui()
  .component('button')
  .variant('primary')
  .size('lg')
  .getConfig();

// Apply to your component
<button 
  className={buttonConfig.className}
  style={buttonConfig.style}
  aria-label={buttonConfig.a11y.ariaLabel}
>
  Submit
</button>
```

## Full Example

```typescript
import { sdk } from '@federated/facade';

async function main() {
  // Authenticate
  const auth = await sdk.auth().clientCredentials().execute();
  
  if (!auth.success) {
    sdk.errors().capture(new Error('Auth failed')).send();
    return;
  }

  // Track that we started
  sdk.telemetry().increment('app.started');

  try {
    // Do some work
    const result = await sdk.telemetry().time(
      'main.operation',
      async () => {
        // Your business logic here
        return { success: true };
      }
    );

    console.log('Done:', result);
  } catch (err) {
    sdk.errors()
      .capture(err)
      .inComponent('Main')
      .withSeverity('error')
      .send();
  }
}

main();
```

## Next Steps

- [Configuration](configuration.md) — Customize SDK behavior
- [SDK Reference](../sdk/overview.md) — Deep dive into each package
- [Architecture](../architecture/patterns.md) — Understand the design
