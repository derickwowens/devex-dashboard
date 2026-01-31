# Telemetry SDK

The `@federated/telemetry` package provides centralized metrics, tracing, and observability.

## Quick Start

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

## Metrics

### Recording Metrics

```typescript
// Simple metric
sdk.telemetry().metric('requests.count').increment();

// Metric with value
sdk.telemetry()
  .metric('response.time')
  .value(245)
  .unit('ms')
  .send();

// Metric with tags
sdk.telemetry()
  .metric('db.queries')
  .value(1)
  .tags({
    table: 'users',
    operation: 'select'
  })
  .send();
```

### Metric Types

| Type | Method | Description |
|------|--------|-------------|
| Counter | `.increment()` | Monotonically increasing |
| Gauge | `.value(n)` | Point-in-time value |
| Histogram | `.histogram(n)` | Distribution of values |
| Timer | `.timer()` | Duration measurement |

## Tracing

### Creating Spans

```typescript
const span = sdk.telemetry()
  .trace('user.fetch')
  .start();

try {
  const user = await fetchUser(id);
  span.setTag('userId', id);
  span.finish();
} catch (err) {
  span.setError(err);
  span.finish();
}
```

### Automatic Instrumentation

```typescript
// Wrap async operations
const result = await sdk.telemetry()
  .trace('database.query')
  .wrap(async () => {
    return await db.query('SELECT * FROM users');
  });
```

## Dashboards

Telemetry data flows to your configured backend (DataDog, Prometheus, etc.):

```typescript
await sdk.initialize({
  telemetry: {
    backend: 'datadog',
    apiKey: process.env.DD_API_KEY,
    service: 'my-service'
  }
});
```
