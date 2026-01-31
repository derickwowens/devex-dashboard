# Authentication SDK

The `@federated/auth` package provides centralized authentication using Microsoft Entra with On-Behalf-Of (OBO) flow.

## Quick Start

```typescript
import { sdk } from '@federated/facade';

// Login with authorization code
const result = await sdk.auth()
  .loginWithCode(authCode)
  .execute();

// Check permissions
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  await sdk.pipelines().trigger('my-project', 'main');
}
```

## Authentication Flows

### Authorization Code Flow

```typescript
const result = await sdk.auth()
  .loginWithCode(code)
  .execute();

// Access the token
console.log(result.accessToken);
```

### On-Behalf-Of Flow

For downstream service calls:

```typescript
const oboResult = await sdk.auth()
  .onBehalfOf(userToken)
  .forScopes(['api://downstream/.default'])
  .execute();
```

### Client Credentials

For service-to-service authentication:

```typescript
const appResult = await sdk.auth()
  .clientCredentials()
  .execute();
```

## Permission Checking

```typescript
// Check single permission
if (await sdk.auth().hasPermission('resource', 'action')) {
  // Proceed
}

// Check multiple permissions
const permissions = await sdk.auth().checkPermissions([
  { resource: 'pipelines', action: 'create' },
  { resource: 'errors', action: 'read' }
]);
```

## Role Store

Roles are stored in a centralized role store (S3/DynamoDB) and merged with Entra claims:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Entra     │────▶│  Role Store │
│  (User/App) │     │  (Azure AD) │     │  (S3/Dynamo)│
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────────────────────┐
                    │     Federated Token         │
                    │  (Entra claims + Roles)     │
                    └─────────────────────────────┘
```

## Configuration

```typescript
await sdk.initialize({
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    redirectUri: 'http://localhost:3000/callback'
  }
});
```
