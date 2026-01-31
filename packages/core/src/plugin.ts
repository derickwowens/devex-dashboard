/**
 * Plugin interface for child SDKs to implement.
 * Each plugin provides a specific capability to the ecosystem.
 */

export interface PluginMetadata {
  /** Unique identifier for the plugin */
  name: string;
  /** Semantic version of the plugin */
  version: string;
  /** Human-readable description */
  description: string;
  /** Dependencies on other plugins */
  dependencies?: string[];
}

export interface Plugin<TFluent = unknown> {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;
  
  /**
   * Initialize the plugin with configuration.
   * Called once when the plugin is registered.
   */
  initialize(config?: Record<string, unknown>): Promise<void>;
  
  /**
   * Returns the fluent API interface for this plugin.
   * This is what consumers interact with.
   */
  fluent(): TFluent;
  
  /**
   * Cleanup resources when the SDK is destroyed.
   */
  destroy(): Promise<void>;
}

/**
 * Base class for plugins with common functionality.
 */
export abstract class BasePlugin<TFluent> implements Plugin<TFluent> {
  abstract readonly metadata: PluginMetadata;
  
  protected initialized = false;
  protected config: Record<string, unknown> = {};
  
  async initialize(config?: Record<string, unknown>): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.config = config ?? {};
    await this.onInitialize();
    this.initialized = true;
  }
  
  abstract fluent(): TFluent;
  
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    await this.onDestroy();
    this.initialized = false;
  }
  
  protected async onInitialize(): Promise<void> {
    // Override in subclasses if needed
  }
  
  protected async onDestroy(): Promise<void> {
    // Override in subclasses if needed
  }
}
