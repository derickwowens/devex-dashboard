# Configuration

## SDK Configuration

Create a custom SDK instance with your configuration:

```typescript
import { createSDK } from '@federated/facade';

const sdk = createSDK({
  environment: 'production',
  debug: false,
  apiBaseUrl: 'https://api.yourcompany.com',
  auth: {
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/auth/callback',
    scopes: ['openid', 'profile', 'email', 'api://your-api/.default'],
  },
});

await sdk.initialize();
```

## Configuration Options

### FacadeConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `environment` | `'development' \| 'staging' \| 'production'` | `'development'` | Current environment |
| `debug` | `boolean` | `true` | Enable debug logging |
| `apiBaseUrl` | `string` | `'http://localhost:3000'` | Base URL for API calls |
| `auth` | `AuthConfig` | `undefined` | Authentication configuration |

### AuthConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `tenantId` | `string` | Yes | Microsoft Entra tenant ID |
| `clientId` | `string` | Yes | Application (client) ID |
| `clientSecret` | `string` | No | Client secret (for confidential clients) |
| `redirectUri` | `string` | No | OAuth redirect URI |
| `scopes` | `string[]` | No | Scopes to request |

## Environment Variables

We recommend using environment variables for sensitive configuration:

```bash
# .env
FEDERATED_TENANT_ID=your-tenant-id
FEDERATED_CLIENT_ID=your-client-id
FEDERATED_CLIENT_SECRET=your-secret
FEDERATED_ENVIRONMENT=production
```

```typescript
const sdk = createSDK({
  environment: process.env.FEDERATED_ENVIRONMENT as any,
  auth: {
    tenantId: process.env.FEDERATED_TENANT_ID,
    clientId: process.env.FEDERATED_CLIENT_ID,
    clientSecret: process.env.FEDERATED_CLIENT_SECRET,
  },
});
```

## Role Store Configuration

Configure where roles are stored:

```typescript
// S3 Backend
const sdk = createSDK({
  auth: {
    // ... other auth config
    roleStore: {
      type: 's3',
      bucket: 'my-roles-bucket',
      region: 'us-east-1',
    },
  },
});

// DynamoDB Backend
const sdk = createSDK({
  auth: {
    roleStore: {
      type: 'dynamodb',
      table: 'federated-roles',
      region: 'us-east-1',
    },
  },
});

// In-Memory (for development)
const sdk = createSDK({
  auth: {
    roleStore: {
      type: 'memory',
    },
  },
});
```

## Plugin-Specific Configuration

Each plugin can be configured individually:

```typescript
const sdk = createSDK({
  plugins: {
    'error-handling': {
      maxStoreSize: 500,
      logToConsole: true,
    },
    'telemetry': {
      sampleRate: 0.5,
      flushIntervalMs: 5000,
    },
  },
});
```

## Build Scripts Configuration

The build scripts accept configuration via command-line arguments:

```bash
# Build with options
./scripts/build.sh --package auth --clean --production

# Environment management
./scripts/env.sh start --env production --port 8080
```

See [Build Scripts](../contributing/guidelines.md#build-scripts) for full documentation.
