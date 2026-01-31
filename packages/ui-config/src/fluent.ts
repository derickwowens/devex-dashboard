/**
 * Fluent API for UI configuration.
 * Provides a chainable interface for building component configurations.
 */

import { ComponentConfig, ComponentSize, ComponentVariant, ThemeConfig } from './types';
import { ComponentRegistry } from './registry';

type ComponentType = 'button' | 'input' | 'card' | 'badge' | 'alert' | 'modal' | 'table';

export class UIFluent {
  private registry: ComponentRegistry;
  private currentComponent: ComponentType | null = null;
  private currentVariant: ComponentVariant = 'primary';
  private currentSize: ComponentSize = 'md';
  private customProps: Record<string, unknown> = {};
  private customStyle: Record<string, string> = {};
  private customClassName: string[] = [];
  private a11yConfig: ComponentConfig['a11y'] = {};

  constructor(registry: ComponentRegistry) {
    this.registry = registry;
  }

  /**
   * Select a component type.
   * @example
   * ui().component('button').variant('primary').getConfig();
   */
  component(type: ComponentType): this {
    this.currentComponent = type;
    return this;
  }

  /**
   * Set the component variant.
   */
  variant(variant: ComponentVariant): this {
    this.currentVariant = variant;
    return this;
  }

  /**
   * Set the component size.
   */
  size(size: ComponentSize): this {
    this.currentSize = size;
    return this;
  }

  /**
   * Add custom props to the component.
   */
  withProps(props: Record<string, unknown>): this {
    this.customProps = { ...this.customProps, ...props };
    return this;
  }

  /**
   * Add custom inline styles.
   */
  withStyle(style: Record<string, string>): this {
    this.customStyle = { ...this.customStyle, ...style };
    return this;
  }

  /**
   * Add custom CSS classes.
   */
  withClassName(...classNames: string[]): this {
    this.customClassName.push(...classNames);
    return this;
  }

  /**
   * Set accessibility attributes.
   */
  withA11y(a11y: ComponentConfig['a11y']): this {
    this.a11yConfig = { ...this.a11yConfig, ...a11y };
    return this;
  }

  /**
   * Set aria-label.
   */
  ariaLabel(label: string): this {
    this.a11yConfig.ariaLabel = label;
    return this;
  }

  /**
   * Set role attribute.
   */
  role(role: string): this {
    this.a11yConfig.role = role;
    return this;
  }

  /**
   * Build and return the component configuration.
   */
  getConfig(): ComponentConfig {
    if (!this.currentComponent) {
      throw new Error('No component selected. Call component() first.');
    }

    const baseConfig = this.registry.get(
      this.currentComponent,
      this.currentVariant,
      this.currentSize
    );

    const config: ComponentConfig = {
      ...baseConfig,
      className: [baseConfig.className, ...this.customClassName].join(' ').trim(),
      style: { ...baseConfig.style, ...this.customStyle },
      props: { ...baseConfig.props, ...this.customProps },
      a11y: { ...baseConfig.a11y, ...this.a11yConfig },
    };

    // Reset for next use
    this.reset();

    return config;
  }

  /**
   * Get the current theme.
   */
  getTheme(): ThemeConfig {
    return this.registry.getTheme();
  }

  /**
   * Get available component types.
   */
  getComponentTypes(): ComponentType[] {
    return this.registry.getComponentTypes();
  }

  /**
   * Create a new fluent instance (for chaining from a fresh state).
   */
  fresh(): UIFluent {
    return new UIFluent(this.registry);
  }

  /**
   * Convenience method to get a button config.
   */
  button(variant: ComponentVariant = 'primary', size: ComponentSize = 'md'): ComponentConfig {
    return this.component('button').variant(variant).size(size).getConfig();
  }

  /**
   * Convenience method to get an input config.
   */
  input(variant: ComponentVariant = 'outline', size: ComponentSize = 'md'): ComponentConfig {
    return this.component('input').variant(variant).size(size).getConfig();
  }

  /**
   * Convenience method to get a card config.
   */
  card(variant: ComponentVariant = 'secondary', size: ComponentSize = 'md'): ComponentConfig {
    return this.component('card').variant(variant).size(size).getConfig();
  }

  private reset(): void {
    this.currentComponent = null;
    this.currentVariant = 'primary';
    this.currentSize = 'md';
    this.customProps = {};
    this.customStyle = {};
    this.customClassName = [];
    this.a11yConfig = {};
  }
}
