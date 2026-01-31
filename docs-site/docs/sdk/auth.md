# Authentication SDK

The `@federated/auth` package provides centralized authentication using Microsoft Entra (Azure AD) with On-Behalf-Of (OBO) flow and role-based access control.

## Why Centralized Auth?

- **One implementation** — No more per-team auth code
- **Consistent security** — Same patterns everywhere
- **Role management** — Centralized in S3/DynamoDB
- **Token handling** — Refresh and caching automatic

## Quick Start

```typescript
import { sdk } from '@federated/facade';

// Login with authorization code
const result = await sdk.auth()
  .loginWithCode(authCode)
  .execute();

if (result.success) {
  console.log('Welcome', result.context.identity.displayName);
}
```

## Authentication Flows

### Authorization Code Flow (Users)

For interactive user login:

```typescript
// 1. Get the login URL
const loginUrl = sdk.auth().getLoginUrl();

// 2. Redirect user to loginUrl
// 3. Handle callback with authorization code
const result = await sdk.auth()
  .loginWithCode(code)
  .execute();
```

### Client Credentials (Services)

For service-to-service authentication:

```typescript
const result = await sdk.auth()
  .clientCredentials()
  .execute();

if (result.success) {
  // Use result.context.identity.federatedToken for API calls
}
```

### On-Behalf-Of Flow

Exchange a user token for a downstream service token:

```typescript
const downstream = await sdk.auth()
  .onBehalfOf(userToken)
  .forScopes(['api://downstream-service/.default'])
  .execute();
```

## Permission Checking

```typescript
// Check before sensitive operations
if (await sdk.auth().hasPermission('pipelines', 'create')) {
  await sdk.pipelines().trigger('project', 'main');
}

// Check roles
if (sdk.auth().hasRole('role-admin')) {
  // Admin-only functionality
}
```

## Role Store

Roles are stored externally (S3 or DynamoDB) and fetched by user/app ID:

```
User authenticates with Entra
         ↓
Entra token received
         ↓
Query role store by user ID
         ↓
Issue federated token (Entra claims + roles)
         ↓
Use federated token for all downstream calls
```

### Role Structure

```typescript
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  scope: 'global' | 'project' | 'team';
  scopeId?: string;
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute' | '*')[];
}
```

## API Reference

### AuthFluent

| Method | Description |
|--------|-------------|
| `loginWithCode(code)` | Start auth code flow |
| `clientCredentials()` | Start client credentials flow |
| `onBehalfOf(token)` | Start OBO flow |
| `withToken(token)` | Validate existing token |
| `getLoginUrl(state?)` | Get authorization URL |
| `isAuthenticated()` | Check if authenticated |
| `getCurrentUser()` | Get current user identity |
| `getCurrentApp()` | Get current app identity |
| `hasRole(roleId)` | Check if has role |
| `hasPermission(resource, action)` | Check permission |
| `logout()` | Clear auth context |
