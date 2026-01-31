/**
 * The main Federated Facade - unified entry point for the ecosystem.
 */

import { ErrorHandlingPlugin, ErrorFluent } from '@federated/error-handling';
import { UIConfigPlugin, UIFluent } from '@federated/ui-config';
import { TelemetryPlugin, TelemetryFluent } from '@federated/telemetry';
import { AuthPlugin, AuthFluent } from '@federated/auth';
import { PipelinesFluent, PipelinesStore } from './pipelines';
import { ContactsFluent, ContactsStore } from './contacts';
import { DocumentationFluent, DocumentationStore } from './documentation';

export interface FacadeConfig {
  environment?: 'development' | 'staging' | 'production';
  debug?: boolean;
  apiBaseUrl?: string;
  auth?: {
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scopes?: string[];
  };
}

/**
 * FederatedFacade - The thin layer that orchestrates all SDK capabilities.
 * 
 * This is the primary interface for consumers. It provides:
 * - Fluent APIs for all ecosystem capabilities
 * - Unified configuration
 * - Version management
 * - Plugin orchestration
 */
export class FederatedFacade {
  private config: FacadeConfig;
  private errorPlugin: ErrorHandlingPlugin;
  private uiPlugin: UIConfigPlugin;
  private telemetryPlugin: TelemetryPlugin;
  private authPlugin: AuthPlugin;
  private pipelinesStore: PipelinesStore;
  private contactsStore: ContactsStore;
  private documentationStore: DocumentationStore;
  private initialized = false;

  static readonly VERSION = '1.0.0';

  constructor(config: FacadeConfig = {}) {
    this.config = {
      environment: 'development',
      debug: true,
      apiBaseUrl: 'http://localhost:3000',
      ...config,
    };

    this.errorPlugin = new ErrorHandlingPlugin();
    this.uiPlugin = new UIConfigPlugin();
    this.telemetryPlugin = new TelemetryPlugin();
    this.authPlugin = new AuthPlugin();
    this.pipelinesStore = new PipelinesStore();
    this.contactsStore = new ContactsStore();
    this.documentationStore = new DocumentationStore();
  }

  /**
   * Initialize all plugins. Call this before using the facade.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.all([
      this.errorPlugin.initialize({ 
        environment: this.config.environment,
        logToConsole: this.config.debug,
      }),
      this.uiPlugin.initialize(),
      this.telemetryPlugin.initialize(),
      this.authPlugin.initialize(this.config.auth),
    ]);

    this.initialized = true;

    if (this.config.debug) {
      console.log(`[FederatedFacade] Initialized v${FederatedFacade.VERSION}`);
    }
  }

  /**
   * Error handling fluent API.
   * @example
   * sdk.errors().capture(err).withContext({ userId }).send();
   */
  errors(): ErrorFluent {
    return this.errorPlugin.fluent();
  }

  /**
   * UI configuration fluent API.
   * @example
   * sdk.ui().component('button').variant('primary').getConfig();
   */
  ui(): UIFluent {
    return this.uiPlugin.fluent();
  }

  /**
   * Telemetry fluent API.
   * @example
   * sdk.telemetry().metric('api.latency').value(150).unit('ms').send();
   */
  telemetry(): TelemetryFluent {
    return this.telemetryPlugin.fluent();
  }

  /**
   * Pipelines fluent API (for GitLab/CI integration).
   * @example
   * sdk.pipelines().list().filter({ status: 'running' }).execute();
   */
  pipelines(): PipelinesFluent {
    return new PipelinesFluent(this.pipelinesStore);
  }

  /**
   * Contacts fluent API (address book).
   * @example
   * sdk.contacts().search('john').inOrg('engineering').execute();
   */
  contacts(): ContactsFluent {
    return new ContactsFluent(this.contactsStore);
  }

  /**
   * Authentication fluent API.
   * @example
   * const result = await sdk.auth().loginWithCode(code).execute();
   * sdk.auth().hasPermission('pipelines', 'create');
   */
  auth(): AuthFluent {
    return this.authPlugin.fluent();
  }

  /**
   * Documentation fluent API.
   * @example
   * const docs = await sdk.docs().search('auth').type('guide').execute();
   * const linked = await sdk.docs().linkedTo('pipeline', 'pipeline-1');
   */
  docs(): DocumentationFluent {
    return new DocumentationFluent(this.documentationStore);
  }

  /**
   * Get the error store for dashboard access.
   */
  getErrorStore() {
    return this.errorPlugin.getStore();
  }

  /**
   * Get the telemetry store for dashboard access.
   */
  getTelemetryStore() {
    return this.telemetryPlugin.getStore();
  }

  /**
   * Get the pipelines store for dashboard access.
   */
  getPipelinesStore() {
    return this.pipelinesStore;
  }

  /**
   * Get the contacts store for dashboard access.
   */
  getContactsStore() {
    return this.contactsStore;
  }

  /**
   * Get the auth plugin for direct access.
   */
  getAuthPlugin() {
    return this.authPlugin;
  }

  /**
   * Get version information.
   */
  getVersionInfo(): {
    facade: string;
    plugins: Record<string, string>;
  } {
    return {
      facade: FederatedFacade.VERSION,
      plugins: {
        'error-handling': this.errorPlugin.metadata.version,
        'ui-config': this.uiPlugin.metadata.version,
        'telemetry': this.telemetryPlugin.metadata.version,
        'auth': this.authPlugin.metadata.version,
      },
    };
  }

  /**
   * Get current configuration.
   */
  getConfig(): Readonly<FacadeConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Cleanup and destroy the facade.
   */
  async destroy(): Promise<void> {
    await Promise.all([
      this.errorPlugin.destroy(),
      this.uiPlugin.destroy(),
      this.telemetryPlugin.destroy(),
      this.authPlugin.destroy(),
    ]);
    this.initialized = false;
  }
}

/**
 * Create a new SDK instance with custom configuration.
 */
export function createSDK(config?: FacadeConfig): FederatedFacade {
  return new FederatedFacade(config);
}

/**
 * Default SDK singleton for convenience.
 * Auto-initializes on first use.
 */
let defaultInstance: FederatedFacade | null = null;

export const sdk = new Proxy({} as FederatedFacade, {
  get(_, prop: keyof FederatedFacade) {
    if (!defaultInstance) {
      defaultInstance = new FederatedFacade();
      defaultInstance.initialize().catch(console.error);
    }
    const value = defaultInstance[prop];
    if (typeof value === 'function') {
      return value.bind(defaultInstance);
    }
    return value;
  },
});
