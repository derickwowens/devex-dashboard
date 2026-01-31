# Structured Logging Standard

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Owner:** Platform Engineering Team

## Overview

This document defines the **Structured Logging Standard** for the Federated DevEx Platform ecosystem. All errors captured through the SDK must adhere to this standard to ensure consistent error tracking, rapid incident triage, and accurate ticket routing.

## The Philosophy: Fast Triaging

!!! tip "Core Principle"
    **Every error message must contain everything needed to route a ticket—no exceptions, no lookups required.**

Traditional error logging often lacks the context needed to quickly resolve issues:

| Traditional Approach | Our Approach |
|------------------------|-----------------|
| "Error: Connection failed" | `AUTH-00142: Connection failed: Platform Auth: auth-team@company.com: #auth-incidents` |
| *Who owns this? Where do I file a ticket?* | *Instant triage. Zero research.* |

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

### Examples

```
AUTH-00142: Token refresh failed: invalid grant: Platform Auth: auth-team@company.com: #auth-incidents
```

```
PIPE-00034: Pipeline execution failed: build step timeout: DevOps: devops@company.com: #devops-incidents
```

```
TEL-00023: Memory threshold exceeded - 95% utilization: Observability: observability@company.com: #obs-incidents
```

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

## Stack Trace Format

When including a stack trace, the error string MUST appear as the first line:

```
AUTH-00142: Token refresh failed: invalid grant: Platform Auth: auth-team@company.com: #auth-incidents
    at AuthService.refreshToken (/src/auth/service.ts:142)
    at async TokenManager.refresh (/src/auth/token.ts:67)
    at async middleware (/src/middleware/auth.ts:23)
```

## Required Metadata

Every error report MUST include the following structured metadata:

### Error Identification

```typescript
interface ErrorIdentification {
  errorId: string;      // e.g., "AUTH-00142"
  id: string;           // Internal UUID for tracking
  name: string;         // Error class name
  message: string;      // Human-readable description
  severity: ErrorSeverity;
}
```

### Ownership Information

!!! warning "Critical for Ticket Routing"
    Every error MUST specify ownership information.

```typescript
interface ErrorOwnership {
  team: string;           // Team responsible (e.g., "Platform Auth")
  email: string;          // Contact email (e.g., "auth-team@company.com")
  incidentGroup: string;  // Slack/Teams channel (e.g., "#auth-incidents")
}
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

## Team Ownership Registry

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
