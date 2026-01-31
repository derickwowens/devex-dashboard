/**
 * Component Registry - stores and retrieves component configurations.
 */

import { ComponentConfig, ComponentSize, ComponentVariant, ThemeConfig } from './types';

type ComponentType = 'button' | 'input' | 'card' | 'badge' | 'alert' | 'modal' | 'table';

interface ConfigKey {
  component: ComponentType;
  variant: ComponentVariant;
  size: ComponentSize;
}

export class ComponentRegistry {
  private configs: Map<string, Partial<ComponentConfig>> = new Map();
  private theme: ThemeConfig;
  private baseClasses: Map<ComponentType, string> = new Map();

  constructor(theme?: ThemeConfig) {
    this.theme = theme ?? this.getDefaultTheme();
    this.initializeDefaults();
  }

  /**
   * Register a component configuration.
   */
  register(
    component: ComponentType,
    variant: ComponentVariant,
    size: ComponentSize,
    config: Partial<ComponentConfig>
  ): void {
    const key = this.buildKey({ component, variant, size });
    this.configs.set(key, config);
  }

  /**
   * Get a component configuration.
   */
  get(
    component: ComponentType,
    variant: ComponentVariant = 'primary',
    size: ComponentSize = 'md'
  ): ComponentConfig {
    const key = this.buildKey({ component, variant, size });
    const stored = this.configs.get(key) ?? {};
    
    return {
      component,
      variant,
      size,
      className: this.buildClassName(component, variant, size),
      style: this.buildStyle(component, variant, size),
      props: {},
      a11y: {},
      ...stored,
    };
  }

  /**
   * Get the current theme.
   */
  getTheme(): ThemeConfig {
    return this.theme;
  }

  /**
   * Update the theme.
   */
  setTheme(theme: ThemeConfig): void {
    this.theme = theme;
  }

  /**
   * Get all registered component types.
   */
  getComponentTypes(): ComponentType[] {
    return ['button', 'input', 'card', 'badge', 'alert', 'modal', 'table'];
  }

  private buildKey(key: ConfigKey): string {
    return `${key.component}:${key.variant}:${key.size}`;
  }

  private buildClassName(
    component: ComponentType,
    variant: ComponentVariant,
    size: ComponentSize
  ): string {
    const base = this.baseClasses.get(component) ?? '';
    const variantClass = this.getVariantClass(variant);
    const sizeClass = this.getSizeClass(size);
    
    return [base, variantClass, sizeClass].filter(Boolean).join(' ');
  }

  private buildStyle(
    component: ComponentType,
    variant: ComponentVariant,
    size: ComponentSize
  ): Record<string, string> {
    const colors = this.theme.colors;
    const styles: Record<string, string> = {};

    switch (variant) {
      case 'primary':
        styles.backgroundColor = colors.primary;
        styles.color = colors.background;
        break;
      case 'secondary':
        styles.backgroundColor = colors.secondary;
        styles.color = colors.foreground;
        break;
      case 'outline':
        styles.backgroundColor = 'transparent';
        styles.borderColor = colors.border;
        styles.color = colors.foreground;
        break;
      case 'ghost':
        styles.backgroundColor = 'transparent';
        styles.color = colors.foreground;
        break;
      case 'destructive':
        styles.backgroundColor = colors.destructive;
        styles.color = colors.background;
        break;
    }

    styles.borderRadius = this.theme.borderRadius.md;
    styles.padding = `${this.theme.spacing[size]} ${this.theme.spacing[this.getHorizontalSpacing(size)]}`;
    styles.fontSize = this.theme.fontSize[size];

    return styles;
  }

  private getVariantClass(variant: ComponentVariant): string {
    const map: Record<ComponentVariant, string> = {
      primary: 'variant-primary',
      secondary: 'variant-secondary',
      outline: 'variant-outline',
      ghost: 'variant-ghost',
      destructive: 'variant-destructive',
    };
    return map[variant];
  }

  private getSizeClass(size: ComponentSize): string {
    const map: Record<ComponentSize, string> = {
      xs: 'size-xs',
      sm: 'size-sm',
      md: 'size-md',
      lg: 'size-lg',
      xl: 'size-xl',
    };
    return map[size];
  }

  private getHorizontalSpacing(size: ComponentSize): ComponentSize {
    const map: Record<ComponentSize, ComponentSize> = {
      xs: 'sm',
      sm: 'md',
      md: 'lg',
      lg: 'xl',
      xl: 'xl',
    };
    return map[size];
  }

  private initializeDefaults(): void {
    this.baseClasses.set('button', 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2');
    this.baseClasses.set('input', 'flex w-full border bg-transparent transition-colors focus:outline-none focus:ring-2');
    this.baseClasses.set('card', 'rounded-lg border bg-card text-card-foreground shadow-sm');
    this.baseClasses.set('badge', 'inline-flex items-center rounded-full font-semibold');
    this.baseClasses.set('alert', 'relative w-full rounded-lg border p-4');
    this.baseClasses.set('modal', 'fixed inset-0 z-50 flex items-center justify-center');
    this.baseClasses.set('table', 'w-full caption-bottom text-sm');
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      name: 'default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
        background: '#ffffff',
        foreground: '#0f172a',
        muted: '#f1f5f9',
        mutedForeground: '#64748b',
        border: '#e2e8f0',
        destructive: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      fontFamily: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'JetBrains Mono, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
    };
  }
}
