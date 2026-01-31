# Structured Logging Standard

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Owner:** Platform Engineering Team

## Overview

This document defines the **Structured Logging Standard** for the Federated DevEx Platform ecosystem. All errors captured through the SDK must adhere to this standard to ensure consistent error tracking, rapid incident triage, and accurate ticket routing.

## Why Structured Logging?

Traditional error logging often lacks the context needed to quickly resolve issues:

- "Error: Connection failed" — *Who owns this? Where do I file a ticket?*
- `[AUTH-00142] Connection failed` — *Auth team, auth-team@company.com, #auth-incidents*

Structured logging eliminates guesswork by embedding ownership and routing information directly in every error.

## Error ID Format

Every error MUST have a unique **Error ID** in the following format:

```
{SDK_PREFIX}-{NUMERIC_ID}
```

### SDK Prefixes

| SDK/API Name | Prefix | Description |
|--------------|--------|-------------|
| `@federated/auth` | `AUTH` | Authentication & authorization |
| `@federated/error-handling` | `ERR` | Error handling infrastructure |
| `@federated/telemetry` | `TEL` | Metrics and observability |
| `@federated/ui-config` | `UI` | UI configuration system |
| `@federated/facade` | `SDK` | Main SDK facade |
| `@federated/pipelines` | `PIPE` | CI/CD pipeline integration |

### Examples

- `AUTH-00142` — Authentication timeout error
- `PIPE-00089` — Pipeline execution failure
- `TEL-00023` — Metrics collection error
- `SDK-00001` — General SDK initialization error

## Required Metadata

Every error report MUST include the following structured metadata:

### 1. Error Identification

```typescript
interface ErrorIdentification {
  errorId: string;      // e.g., "AUTH-00142"
  id: string;           // Internal UUID for tracking
  name: string;         // Error class name
  message: string;      // Human-readable description
  severity: ErrorSeverity;
}
```

### 2. SDK/API Source

```typescript
sdkName: string;  // e.g., "@federated/auth"
```

This identifies which SDK/API originated the error, enabling filtering and routing.

### 3. Ownership Information

**Critical for ticket routing.** Every error MUST specify ownership:

```typescript
interface ErrorOwnership {
  team: string;           // Team responsible (e.g., "Platform Auth")
  email: string;          // Contact email (e.g., "auth-team@company.com")
  incidentGroup: string;  // Slack/Teams channel (e.g., "#auth-incidents")
}
```

### 4. Context

```typescript
interface ErrorContext {
  userId?: string;       // Affected user
  sessionId?: string;    // Session identifier
  operation?: string;    // What was being attempted
  component?: string;    // Service/component name
  requestId?: string;    // Correlation ID
  metadata?: Record<string, unknown>;
  tags?: string[];
}
```

## Complete Error Report Schema

```typescript
interface ErrorReport {
  // Identification
  errorId: string;           // "AUTH-00142"
  id: string;                // "550e8400-e29b-41d4-a716-446655440000"
  
  // Error Details
  name: string;              // "AuthenticationError"
  message: string;           // "Token refresh failed: invalid grant"
  severity: ErrorSeverity;   // "error"
  stack?: string;            // Full stack trace
  
  // Source & Environment
  sdkName: string;           // "@federated/auth"
  environment: string;       // "production"
  timestamp: Date;
  
  // Ownership (for ticket routing)
  ownership: {
    team: string;            // "Platform Auth"
    email: string;           // "auth-team@company.com"
    incidentGroup: string;   // "#auth-incidents"
  };
  
  // Context
  context: {
    userId?: string;
    operation?: string;
    requestId?: string;
    // ... additional context
  };
  
  handled: boolean;
}
```

## Error String Format (REQUIRED)

**All errors in the ecosystem MUST use this standardized format:**

```
[ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
```

### Format Components

| Component | Description | Example |
|-----------|-------------|---------|
| `ErrorCode` | Unique error identifier | `AUTH-00142` |
| `ErrorString` | Human-readable error message | `Token refresh failed: invalid grant` |
| `TeamName` | Responsible team name | `Platform Auth` |
| `TeamEmail` | Team contact email | `auth-team@company.com` |
| `IncidentGroup` | Incident channel/group | `#auth-incidents` |

### Example Output

```
AUTH-00142: Token refresh failed: invalid grant: Platform Auth: auth-team@company.com: #auth-incidents
```

```
PIPE-00034: Pipeline execution failed: build step timeout: DevOps: devops@company.com: #devops-incidents
```

```
TEL-00023: Memory threshold exceeded - 95% utilization: Observability: observability@company.com: #obs-incidents
```

### Why This Format?

This standardized format ensures that **anyone viewing an error can immediately**:

1. **Identify the error uniquely** via the ErrorCode
2. **Understand what happened** via the ErrorString
3. **Know who to contact** via TeamName and TeamEmail
4. **Route tickets correctly** via IncidentGroup

**No more guesswork. No more research. Instant triage.**

### Stack Trace Header

When including a stack trace, the error string MUST appear as the first line:

```
AUTH-00142: Token refresh failed: invalid grant: Platform Auth: auth-team@company.com: #auth-incidents
    at AuthService.refreshToken (/src/auth/service.ts:142)
    at async TokenManager.refresh (/src/auth/token.ts:67)
    at async middleware (/src/middleware/auth.ts:23)
```

## Usage Example

```typescript
import { sdk } from '@federated/facade';

// Capture an error with full structured metadata
sdk.errors()
  .capture(error)
  .withErrorId('AUTH-00142')
  .withSdk('@federated/auth')
  .withOwnership({
    team: 'Platform Auth',
    email: 'auth-team@company.com',
    incidentGroup: '#auth-incidents'
  })
  .withContext({
    userId: user.id,
    operation: 'tokenRefresh',
    requestId: req.id
  })
  .send();
```

## Registering New Error IDs

1. **Check existing IDs** in the error registry to avoid duplicates
2. **Reserve a range** for your SDK (contact Platform Engineering)
3. **Document the error** including:
   - Error ID
   - Description
   - Common causes
   - Resolution steps
4. **Update the error catalog** in this repository

## SDK Team Ownership Registry

| SDK | Team | Email | Incident Group |
|-----|------|-------|----------------|
| `@federated/auth` | Platform Auth | auth-team@company.com | #auth-incidents |
| `@federated/error-handling` | Platform Core | core-team@company.com | #platform-incidents |
| `@federated/telemetry` | Observability | observability@company.com | #obs-incidents |
| `@federated/ui-config` | Frontend Platform | frontend@company.com | #frontend-incidents |
| `@federated/facade` | Platform Core | core-team@company.com | #platform-incidents |
| `@federated/pipelines` | DevOps | devops@company.com | #devops-incidents |

## Benefits

1. **Faster Triage** — Error ID immediately identifies the issue
2. **Accurate Routing** — Tickets go to the right team automatically
3. **Reduced Toil** — No more "who owns this?" investigations
4. **Better Metrics** — Filter and aggregate by SDK, team, or error type
5. **Audit Trail** — Every error is traceable and accountable

## Compliance

All SDKs in the `@federated` namespace MUST comply with this standard. Non-compliant errors will be flagged in the Error Tracking dashboard.

---

*For questions or updates to this standard, contact Platform Engineering at platform@company.com or in #platform-engineering.*
