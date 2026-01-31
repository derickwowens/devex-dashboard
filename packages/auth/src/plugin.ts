/**
 * Auth Plugin for the Federated SDK.
 */

import { AuthFluent } from './fluent';
import { RoleStore, RoleStoreConfig } from './role-store';
import { TokenManager } from './token-manager';
import { EntraClient } from './entra-client';
import { AuthConfig } from './types';

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

export interface AuthPluginConfig {
  /** Microsoft Entra tenant ID */
  tenantId?: string;
  /** Application (client) ID */
  clientId?: string;
  /** Client secret */
  clientSecret?: string;
  /** Redirect URI */
  redirectUri?: string;
  /** Default scopes */
  scopes?: string[];
  /** Role store configuration */
  roleStore?: RoleStoreConfig;
  /** Token signing secret */
  signingSecret?: string;
  /** Token TTL in seconds */
  tokenTtlSeconds?: number;
}

export class AuthPlugin implements Plugin<AuthFluent> {
  readonly metadata: PluginMetadata = {
    name: 'auth',
    version: '1.0.0',
    description: 'Centralized authentication with Microsoft Entra OBO flow',
  };

  private entraClient!: EntraClient;
  private roleStore!: RoleStore;
  private tokenManager!: TokenManager;
  private authFluent!: AuthFluent;
  private initialized = false;

  async initialize(config?: AuthPluginConfig): Promise<void> {
    if (this.initialized) return;

    // Initialize Entra client
    this.entraClient = new EntraClient({
      tenantId: config?.tenantId ?? 'demo-tenant-id',
      clientId: config?.clientId ?? 'demo-client-id',
      clientSecret: config?.clientSecret,
      redirectUri: config?.redirectUri ?? 'http://localhost:3000/auth/callback',
      scopes: config?.scopes ?? ['openid', 'profile', 'email'],
    });

    // Initialize role store
    this.roleStore = new RoleStore(
      config?.roleStore ?? { type: 'memory' }
    );

    // Initialize token manager
    this.tokenManager = new TokenManager({
      signingSecret: config?.signingSecret,
      tokenTtlSeconds: config?.tokenTtlSeconds,
    });

    // Create fluent interface
    this.authFluent = new AuthFluent(
      this.entraClient,
      this.roleStore,
      this.tokenManager
    );

    this.initialized = true;
  }

  fluent(): AuthFluent {
    return this.authFluent;
  }

  /**
   * Get the Entra client for direct access.
   */
  getEntraClient(): EntraClient {
    return this.entraClient;
  }

  /**
   * Get the role store for direct access.
   */
  getRoleStore(): RoleStore {
    return this.roleStore;
  }

  /**
   * Get the token manager for direct access.
   */
  getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  async destroy(): Promise<void> {
    this.tokenManager?.clearAll();
    this.initialized = false;
  }
}
