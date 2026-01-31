# Installation

## Prerequisites

- **Node.js** 18+ or 20+
- **npm** or **yarn**
- **Git**

## Install the Ecosystem SDK

```bash
npm install @federated/facade
```

This installs the main SDK which includes all core packages.

## Individual Packages

You can also install packages individually:

```bash
npm install @federated/auth           # Authentication
npm install @federated/error-handling # Error handling
npm install @federated/telemetry      # Metrics & tracing
npm install @federated/ui-config      # UI configuration
```

## Verify Installation

```typescript
import { sdk } from '@federated/facade';

console.log('Ecosystem SDK loaded:', sdk.version);
```

## Next Steps

- [Quick Start Guide](quick-start.md)
- [SDK Overview](../sdk/overview.md)
