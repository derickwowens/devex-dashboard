/**
 * UI Config Plugin for the Federated SDK.
 */

import { UIFluent } from './fluent';
import { ComponentRegistry } from './registry';
import { ThemeConfig } from './types';

interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}

interface Plugin<TFluent = unknown> {
  readonly metadata: PluginMetadata;
  initialize(config?: Record<string, unknown>): Promise<void>;
  fluent(): TFluent;
  destroy(): Promise<void>;
}

export interface UIConfigPluginConfig {
  /** Custom theme configuration */
  theme?: ThemeConfig;
  /** Custom component configurations */
  components?: Record<string, unknown>;
}

export class UIConfigPlugin implements Plugin<UIFluent> {
  readonly metadata: PluginMetadata = {
    name: 'ui-config',
    version: '1.0.0',
    description: 'Centralized UI component configuration for the Federated DevEx Platform',
  };

  private registry: ComponentRegistry;
  private initialized = false;

  constructor() {
    this.registry = new ComponentRegistry();
  }

  async initialize(config?: UIConfigPluginConfig): Promise<void> {
    if (this.initialized) return;

    if (config?.theme) {
      this.registry.setTheme(config.theme);
    }

    this.initialized = true;
  }

  fluent(): UIFluent {
    return new UIFluent(this.registry);
  }

  /**
   * Get the component registry for direct access.
   */
  getRegistry(): ComponentRegistry {
    return this.registry;
  }

  async destroy(): Promise<void> {
    this.initialized = false;
  }
}
