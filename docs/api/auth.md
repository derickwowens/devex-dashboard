# Auth API Reference

Complete API reference for `sdk.auth()`.

## Methods

### `loginWithCode(code)`

Authenticate using authorization code.

```typescript
await sdk.auth().loginWithCode(code).execute()
```

**Parameters:**
- `code` — Authorization code from OAuth redirect

**Returns:** Promise<AuthResult>

---

### `onBehalfOf(token)`

Start On-Behalf-Of flow for downstream services.

```typescript
await sdk.auth()
  .onBehalfOf(userToken)
  .forScopes(['api://downstream/.default'])
  .execute()
```

**Parameters:**
- `token` — User's access token

---

### `forScopes(scopes)`

Specify scopes for token request.

```typescript
.forScopes(['api://downstream/.default', 'User.Read'])
```

**Parameters:**
- `scopes` — Array of scope strings

---

### `clientCredentials()`

Authenticate using client credentials (service-to-service).

```typescript
await sdk.auth().clientCredentials().execute()
```

**Returns:** Promise<AuthResult>

---

### `hasPermission(resource, action)`

Check if current user has permission.

```typescript
await sdk.auth().hasPermission('pipelines', 'create')
```

**Parameters:**
- `resource` — Resource name
- `action` — Action name

**Returns:** Promise<boolean>

---

### `checkPermissions(permissions)`

Check multiple permissions at once.

```typescript
await sdk.auth().checkPermissions([
  { resource: 'pipelines', action: 'create' },
  { resource: 'errors', action: 'read' }
])
```

**Returns:** Promise<PermissionResult[]>

---

### `logout()`

Clear authentication state.

```typescript
await sdk.auth().logout()
```

---

### `getToken()`

Get the current access token.

```typescript
const token = await sdk.auth().getToken()
```

**Returns:** Promise<string | null>

## Types

```typescript
interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface PermissionResult {
  resource: string;
  action: string;
  allowed: boolean;
}
```

## Configuration

```typescript
await sdk.initialize({
  auth: {
    clientId: 'your-client-id',
    tenantId: 'your-tenant-id',
    redirectUri: 'http://localhost:3000/callback'
  }
});
```
