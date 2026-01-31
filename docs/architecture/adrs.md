# Architecture Decision Records

This page lists all Architecture Decision Records (ADRs) for the Ecosystem platform.

## ADR-001: Fluent Facade Pattern

**Date:** January 2026  
**Status:** Accepted

### Context

Teams were implementing inconsistent APIs across SDKs, making it difficult for engineers to learn and use the platform.

### Decision

Adopt a fluent facade pattern where all external APIs are chainable and follow a consistent structure.

### Consequences

- Consistent, discoverable API
- Better autocomplete support
- Easier to learn
- Requires careful API design
- Facade must be versioned carefully

---

## ADR-002: Centralized Error Handling

**Date:** January 2026  
**Status:** Accepted

### Context

Error handling was inconsistent across teams. Triaging errors required manual research to identify owners.

### Decision

Implement structured logging standard with mandatory ownership metadata embedded in every error.

### Consequences

- Instant error triage
- Automatic ticket routing
- Consistent error format
- Requires team adoption

---

## ADR-003: Microsoft Entra with OBO Flow

**Date:** January 2026  
**Status:** Accepted

### Context

Teams were implementing custom authentication, leading to security inconsistencies.

### Decision

Centralize authentication using Microsoft Entra with On-Behalf-Of flow, combined with a custom role store.

### Consequences

- Single source of truth for auth
- Consistent security model
- Supports downstream services
- Dependency on Azure AD

---

## Template

```markdown
## ADR-XXX: Title

**Date:** Month Year  
**Status:** Proposed | Accepted | Deprecated | Superseded

### Context

What is the situation?

### Decision

What did we decide?

### Consequences

What are the trade-offs?
```
