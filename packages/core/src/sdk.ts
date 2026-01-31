/**
 * FederatedSDK - The main entry point for the ecosystem.
 * Orchestrates all child SDKs through a unified interface.
 */

import { Plugin, PluginMetadata } from './plugin';
import { VersionManager } from './version-manager';
import { SDKConfig, createDefaultConfig } from './config';

interface PluginRegistration {
  plugin: Plugin;
  config?: Record<string, unknown>;
}

export class FederatedSDK {
  private plugins: Map<string, PluginRegistration> = new Map();
  private versionManager: VersionManager;
  private config: SDKConfig;
  private initialized = false;

  constructor(config?: Partial<SDKConfig>) {
    this.config = createDefaultConfig(config);
    this.versionManager = new VersionManager('1.0.0');
  }

  /**
   * Register a plugin with the SDK.
   * @example
   * sdk.register('errors', new ErrorHandlingPlugin());
   */
  register<T extends Plugin>(
    name: string, 
    plugin: T, 
    config?: Record<string, unknown>
  ): this {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin '${name}' is already registered`);
    }
    
    this.plugins.set(name, { plugin, config });
    this.versionManager.registerChild(name, plugin.metadata.version);
    
    if (this.config.debug) {
      console.log(`[FederatedSDK] Registered plugin: ${name}@${plugin.metadata.version}`);
    }
    
    return this;
  }

  /**
   * Initialize all registered plugins.
   * Must be called before using the SDK.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Sort plugins by dependencies
    const sorted = this.topologicalSort();
    
    // Initialize in order
    for (const name of sorted) {
      const registration = this.plugins.get(name)!;
      const pluginConfig = {
        ...this.config.plugins[name],
        ...registration.config,
      };
      
      await registration.plugin.initialize(pluginConfig);
      
      if (this.config.debug) {
        console.log(`[FederatedSDK] Initialized plugin: ${name}`);
      }
    }
    
    this.initialized = true;
  }

  /**
   * Get a plugin by name.
   */
  getPlugin<T extends Plugin>(name: string): T {
    const registration = this.plugins.get(name);
    if (!registration) {
      throw new Error(`Plugin '${name}' is not registered`);
    }
    return registration.plugin as T;
  }

  /**
   * Get the fluent API for a plugin.
   */
  getFluent<T>(name: string): T {
    return this.getPlugin(name).fluent() as T;
  }

  /**
   * Get SDK version information.
   */
  getVersionInfo(): {
    sdkVersion: string;
    plugins: Record<string, string>;
  } {
    return {
      sdkVersion: this.versionManager.getParentVersion(),
      plugins: this.versionManager.getChildVersions(),
    };
  }

  /**
   * Get the current configuration.
   */
  getConfig(): Readonly<SDKConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Check if the SDK is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Destroy the SDK and cleanup all plugins.
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Destroy in reverse order
    const sorted = this.topologicalSort().reverse();
    
    for (const name of sorted) {
      const registration = this.plugins.get(name)!;
      await registration.plugin.destroy();
      
      if (this.config.debug) {
        console.log(`[FederatedSDK] Destroyed plugin: ${name}`);
      }
    }
    
    this.initialized = false;
  }

  /**
   * Topological sort of plugins based on dependencies.
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      const registration = this.plugins.get(name);
      if (!registration) return;
      
      const deps = registration.plugin.metadata.dependencies ?? [];
      for (const dep of deps) {
        visit(dep);
      }
      
      result.push(name);
    };
    
    for (const name of this.plugins.keys()) {
      visit(name);
    }
    
    return result;
  }
}
