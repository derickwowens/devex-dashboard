# UI Configuration SDK

The `@federated/ui-config` package provides centralized UI component configuration.

## Quick Start

```typescript
import { sdk } from '@federated/facade';

// Get button configuration
const buttonConfig = sdk.ui()
  .component('button')
  .variant('primary')
  .size('medium')
  .getConfig();
```

## Component Configuration

### Buttons

```typescript
const config = sdk.ui()
  .component('button')
  .variant('primary')    // primary, secondary, danger, ghost
  .size('medium')        // small, medium, large
  .getConfig();

// Returns: { className: 'btn btn-primary btn-md', ... }
```

### Inputs

```typescript
const inputConfig = sdk.ui()
  .component('input')
  .variant('outlined')
  .size('medium')
  .getConfig();
```

### Cards

```typescript
const cardConfig = sdk.ui()
  .component('card')
  .variant('elevated')
  .padding('lg')
  .getConfig();
```

## Theme Configuration

```typescript
// Access theme values
const theme = sdk.ui().theme();

console.log(theme.colors.primary);    // #6366f1
console.log(theme.spacing.md);        // 16px
console.log(theme.borderRadius.lg);   // 12px
```

## Custom Components

Register custom component configurations:

```typescript
sdk.ui().register('custom-card', {
  base: 'rounded-xl border bg-white',
  variants: {
    elevated: 'shadow-lg',
    flat: 'shadow-none'
  },
  sizes: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
});
```

## Benefits

- **Consistency** — All teams use the same component styles
- **Centralized Updates** — Change styles in one place
- **Type Safety** — Full TypeScript support
- **Theme Support** — Dark mode, custom themes
