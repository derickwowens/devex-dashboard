# Fine-Grain Security Policy

The DevEx Platform uses role-based fine-grain security policies to dynamically control SDK functionality based on user profiles. This enables organizations to precisely control what features and data each user can access.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Fine-Grain Security Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌───────────┐  │
│  │   User   │───▶│  Auth (Entra)│───▶│  Policy Engine  │───▶│  SDK Init │  │
│  │  Login   │    │  + Claims    │    │  (Fine-Grain)   │    │ (Dynamic) │  │
│  └──────────┘    └──────────────┘    └────────┬────────┘    └───────────┘  │
│                                               │                             │
│                                               ▼                             │
│                                    ┌─────────────────────┐                  │
│                                    │   User Profile      │                  │
│                                    │   • Roles           │                  │
│                                    │   • Permissions     │                  │
│                                    │   • Feature Flags   │                  │
│                                    │   • Resource Limits │                  │
│                                    └─────────────────────┘                  │
│                                               │                             │
│                    ┌──────────────────────────┼──────────────────────────┐  │
│                    │                          │                          │  │
│                    ▼                          ▼                          ▼  │
│           ┌───────────────┐         ┌───────────────┐         ┌──────────┐ │
│           │ sdk.auth()    │         │ sdk.pipelines()│        │sdk.errors│ │
│           │ ✓ Available   │         │ ✓/✗ Conditional│        │✓/✗ Based │ │
│           └───────────────┘         └───────────────┘         │on policy │ │
│                                                               └──────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. User Authentication

When a user authenticates via Microsoft Entra ID, the system retrieves their identity claims and group memberships.

```typescript
// User logs in
const authResult = await sdk.auth()
  .loginWithCode(authorizationCode)
  .execute();
```

### 2. Policy Evaluation

The Policy Engine evaluates the user's profile against fine-grain security policies stored in the policy store.

```typescript
// Policy is automatically evaluated on login
// Returns a UserProfile with available capabilities
interface UserProfile {
  userId: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  featureFlags: FeatureFlag[];
  resourceLimits: ResourceLimit[];
  sdkCapabilities: SDKCapability[];
}
```

### 3. Dynamic SDK Initialization

The SDK dynamically enables or disables functionality based on the user's profile.

```typescript
// SDK methods are conditionally available
const user = await sdk.auth().getCurrentUser();

// Check what capabilities this user has
console.log(user.sdkCapabilities);
// Output: ['auth', 'errors:read', 'pipelines:read', 'telemetry:write']
```

## Policy Structure

### Role Definitions

Roles are defined with specific permissions that map to SDK capabilities:

```json
{
  "roles": {
    "developer": {
      "description": "Standard developer access",
      "permissions": [
        "auth:*",
        "errors:read",
        "pipelines:read",
        "pipelines:trigger",
        "telemetry:read",
        "telemetry:write"
      ],
      "featureFlags": ["sdk-playground", "error-triage"],
      "resourceLimits": {
        "api.requests.perHour": 1000,
        "pipelines.concurrent": 5
      }
    },
    "platform-admin": {
      "description": "Platform administrator with full access",
      "permissions": ["*"],
      "featureFlags": ["*"],
      "resourceLimits": {
        "api.requests.perHour": 10000,
        "pipelines.concurrent": 50
      }
    },
    "security-auditor": {
      "description": "Read-only access for security audits",
      "permissions": [
        "auth:read",
        "errors:read",
        "security:read",
        "telemetry:read"
      ],
      "featureFlags": ["security-scans", "error-triage"],
      "resourceLimits": {
        "api.requests.perHour": 500
      }
    }
  }
}
```

### Permission Format

Permissions follow the format: `resource:action` or `resource:*` for all actions.

| Permission | Description |
|------------|-------------|
| `auth:*` | Full authentication capabilities |
| `pipelines:read` | View pipeline status and history |
| `pipelines:trigger` | Trigger new pipeline runs |
| `pipelines:cancel` | Cancel running pipelines |
| `errors:read` | View error reports |
| `errors:write` | Submit error reports |
| `errors:triage` | Access error triage and lookup |
| `telemetry:read` | View metrics and dashboards |
| `telemetry:write` | Submit custom metrics |
| `security:read` | View security scan results |
| `security:admin` | Configure security policies |

## SDK Capability Checking

### Before Calling SDK Methods

```typescript
// Check if user can trigger pipelines
if (await sdk.auth().hasPermission('pipelines', 'trigger')) {
  await sdk.pipelines()
    .trigger('my-project', 'main')
    .execute();
} else {
  console.log('User does not have permission to trigger pipelines');
}
```

### Declarative Permission Guards

```typescript
// Using the permission guard decorator
@requiresPermission('pipelines', 'trigger')
async function deployToProduction() {
  return sdk.pipelines()
    .trigger('production-app', 'main')
    .withVariables({ DEPLOY_ENV: 'production' })
    .execute();
}
```

### Feature Flag Checking

```typescript
// Check if feature is enabled for this user
if (await sdk.features().isEnabled('security-scans')) {
  // Show security scan UI
}

// Get all enabled features
const enabledFeatures = await sdk.features().getEnabled();
// ['sdk-playground', 'error-triage', 'security-scans']
```

## Dynamic UI Based on Permissions

The dashboard dynamically shows/hides features based on user permissions:

```typescript
// React component example
function DashboardNav() {
  const { permissions, featureFlags } = useUserProfile();
  
  return (
    <nav>
      {/* Always available */}
      <NavItem href="/">Dashboard</NavItem>
      
      {/* Conditional based on permissions */}
      {permissions.includes('pipelines:read') && (
        <NavItem href="/pipelines">CI/CD Pipelines</NavItem>
      )}
      
      {permissions.includes('errors:triage') && (
        <NavItem href="/errors">Error Triage</NavItem>
      )}
      
      {permissions.includes('security:read') && (
        <NavItem href="/security">Security Scans</NavItem>
      )}
      
      {/* Feature flag gated */}
      {featureFlags.includes('sdk-playground') && (
        <NavItem href="/sdk">SDK Playground</NavItem>
      )}
    </nav>
  );
}
```

## Policy Store

Policies are stored in a centralized policy store that supports:

- **Real-time updates**: Policy changes take effect immediately
- **Audit logging**: All policy evaluations are logged
- **Version control**: Policy history is maintained
- **Environment separation**: Different policies per environment

```
┌─────────────────────────────────────────────────────────────┐
│                      Policy Store                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   Roles     │   │ Permissions │   │   Feature   │       │
│  │   Store     │   │    Store    │   │    Flags    │       │
│  │  (DynamoDB) │   │  (DynamoDB) │   │  (DynamoDB) │       │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
│         │                 │                 │               │
│         └────────────────┬┘─────────────────┘               │
│                          │                                  │
│                          ▼                                  │
│                 ┌─────────────────┐                         │
│                 │  Policy Cache   │                         │
│                 │   (Redis/DAX)   │                         │
│                 └─────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration with Error Triage

The Error Triage page uses fine-grain permissions to control access:

| Permission | Capability |
|------------|------------|
| `errors:read` | View error list and details |
| `errors:triage` | Access error code lookup |
| `errors:route` | Route errors to teams |
| `errors:resolve` | Mark errors as resolved |

```typescript
// Error lookup requires errors:triage permission
if (await sdk.auth().hasPermission('errors', 'triage')) {
  const errorDetails = await sdk.errors()
    .lookup('AUTH-00142')
    .execute();
    
  console.log(errorDetails.resolution);
  console.log(errorDetails.ownership);
}
```

## Best Practices

1. **Principle of Least Privilege**: Grant only the minimum permissions needed
2. **Role Composition**: Build roles from atomic permissions
3. **Regular Audits**: Review role assignments periodically
4. **Feature Flags for Rollouts**: Use feature flags for gradual rollouts
5. **Environment-Specific Policies**: Different policies for dev/staging/prod

## Related Documentation

- [Authentication SDK](./authentication.md) - Core authentication flows
- [Error Handling](./error-handling.md) - Error capture and routing
- [SDK Overview](./overview.md) - Full SDK capabilities
