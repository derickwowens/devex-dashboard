/**
 * Fluent API for authentication.
 * Provides a chainable interface for auth operations.
 */

import { AuthContext, AuthResult, UserIdentity, AppIdentity, Role } from './types';
import { RoleStore } from './role-store';
import { TokenManager } from './token-manager';
import { EntraClient } from './entra-client';

export class AuthFluent {
  private entraClient: EntraClient;
  private roleStore: RoleStore;
  private tokenManager: TokenManager;
  private currentContext: AuthContext | null = null;

  constructor(
    entraClient: EntraClient,
    roleStore: RoleStore,
    tokenManager: TokenManager
  ) {
    this.entraClient = entraClient;
    this.roleStore = roleStore;
    this.tokenManager = tokenManager;
  }

  /**
   * Authenticate a user with an authorization code.
   * @example
   * const result = await sdk.auth().loginWithCode(code).execute();
   */
  loginWithCode(code: string): AuthFluentBuilder {
    return new AuthFluentBuilder(this, 'code', code);
  }

  /**
   * Authenticate using client credentials (app-to-app).
   * @example
   * const result = await sdk.auth().clientCredentials().execute();
   */
  clientCredentials(): AuthFluentBuilder {
    return new AuthFluentBuilder(this, 'client_credentials');
  }

  /**
   * Validate and use an existing token.
   * @example
   * const result = await sdk.auth().withToken(token).execute();
   */
  withToken(token: string): AuthFluentBuilder {
    return new AuthFluentBuilder(this, 'token', token);
  }

  /**
   * Perform On-Behalf-Of flow with a user token.
   * @example
   * const result = await sdk.auth().onBehalfOf(userToken).forScopes(['api://downstream/.default']).execute();
   */
  onBehalfOf(userToken: string): AuthFluentBuilder {
    return new AuthFluentBuilder(this, 'obo', userToken);
  }

  /**
   * Get the current auth context.
   */
  getContext(): AuthContext | null {
    return this.currentContext;
  }

  /**
   * Set the current auth context.
   */
  setContext(context: AuthContext): void {
    this.currentContext = context;
  }

  /**
   * Clear the current auth context.
   */
  clearContext(): void {
    this.currentContext = null;
  }

  /**
   * Check if currently authenticated.
   */
  isAuthenticated(): boolean {
    return this.currentContext !== null && !this.currentContext.isExpired;
  }

  /**
   * Get the current user identity (if authenticated as user).
   */
  getCurrentUser(): UserIdentity | null {
    if (this.currentContext?.type === 'user') {
      return this.currentContext.identity as UserIdentity;
    }
    return null;
  }

  /**
   * Get the current app identity (if authenticated as app).
   */
  getCurrentApp(): AppIdentity | null {
    if (this.currentContext?.type === 'app') {
      return this.currentContext.identity as AppIdentity;
    }
    return null;
  }

  /**
   * Check if the current identity has a specific role.
   */
  hasRole(roleId: string): boolean {
    if (!this.currentContext) return false;
    return this.currentContext.identity.roles.some(r => r.id === roleId);
  }

  /**
   * Check if the current identity has a specific permission.
   */
  async hasPermission(resource: string, action: string): Promise<boolean> {
    if (!this.currentContext) return false;
    
    const identity = this.currentContext.identity;
    return this.roleStore.hasPermission(
      identity.id,
      this.currentContext.type,
      resource,
      action
    );
  }

  /**
   * Get the authorization URL for interactive login.
   */
  getLoginUrl(state?: string): string {
    return this.entraClient.getAuthorizationUrl(state);
  }

  /**
   * Logout - clear tokens and context.
   */
  logout(): void {
    if (this.currentContext) {
      this.tokenManager.revoke(this.currentContext.identity.id);
    }
    this.clearContext();
  }

  /**
   * Internal: Execute authentication flow.
   */
  async executeAuth(
    flowType: 'code' | 'client_credentials' | 'token' | 'obo',
    credential?: string,
    scopes?: string[]
  ): Promise<AuthResult> {
    try {
      let entraToken;
      let subjectType: 'user' | 'app';

      switch (flowType) {
        case 'code':
          entraToken = await this.entraClient.exchangeCodeForToken(credential!);
          subjectType = 'user';
          break;
        case 'client_credentials':
          entraToken = await this.entraClient.clientCredentials(scopes ?? []);
          subjectType = 'app';
          break;
        case 'obo':
          entraToken = await this.entraClient.onBehalfOf(credential!, scopes ?? []);
          subjectType = 'user';
          break;
        case 'token':
          const validation = await this.entraClient.validateToken(credential!);
          if (!validation.valid || !validation.claims) {
            return {
              success: false,
              error: { code: 'INVALID_TOKEN', message: 'Token validation failed' },
            };
          }
          entraToken = {
            accessToken: credential!,
            tokenType: 'Bearer',
            expiresAt: new Date(validation.claims.exp * 1000),
            scopes: [],
            claims: validation.claims,
          };
          subjectType = validation.claims.upn ? 'user' : 'app';
          break;
        default:
          return {
            success: false,
            error: { code: 'INVALID_FLOW', message: `Unknown flow type: ${flowType}` },
          };
      }

      // Get roles from role store
      const subjectId = entraToken.claims.sub;
      const roles = subjectType === 'user'
        ? await this.roleStore.getRolesForUser(subjectId)
        : await this.roleStore.getRolesForApp(subjectId);

      // Issue federated token
      const { federatedToken, expiresAt } = await this.tokenManager.cacheAndIssue(
        entraToken,
        roles
      );

      // Build identity
      const identity = this.buildIdentity(
        subjectType,
        entraToken,
        roles,
        federatedToken
      );

      // Build context
      const context: AuthContext = {
        type: subjectType,
        identity,
        token: entraToken,
        isExpired: false,
        expiresIn: expiresAt.getTime() - Date.now(),
      };

      this.setContext(context);

      return { success: true, context };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error,
        },
      };
    }
  }

  private buildIdentity(
    type: 'user' | 'app',
    entraToken: { claims: any; accessToken?: string } & Record<string, any>,
    roles: Role[],
    federatedToken: string
  ): UserIdentity | AppIdentity {
    const claims = entraToken.claims;

    if (type === 'user') {
      return {
        id: claims.sub,
        objectId: claims.oid ?? claims.sub,
        upn: claims.upn ?? claims.email ?? 'unknown',
        displayName: claims.name ?? 'Unknown User',
        email: claims.email,
        tenantId: claims.tid ?? 'unknown',
        roles,
        entraToken: entraToken as any,
        federatedToken,
      };
    } else {
      return {
        id: claims.sub,
        name: claims.appid ?? claims.sub,
        tenantId: claims.tid ?? 'unknown',
        roles,
        entraToken: entraToken as any,
        federatedToken,
      };
    }
  }
}

/**
 * Builder for fluent auth operations.
 */
class AuthFluentBuilder {
  private fluent: AuthFluent;
  private flowType: 'code' | 'client_credentials' | 'token' | 'obo';
  private credential?: string;
  private scopes: string[] = [];

  constructor(
    fluent: AuthFluent,
    flowType: 'code' | 'client_credentials' | 'token' | 'obo',
    credential?: string
  ) {
    this.fluent = fluent;
    this.flowType = flowType;
    this.credential = credential;
  }

  /**
   * Specify scopes for the token request.
   */
  forScopes(scopes: string[]): this {
    this.scopes = scopes;
    return this;
  }

  /**
   * Execute the authentication flow.
   */
  async execute(): Promise<AuthResult> {
    return this.fluent.executeAuth(this.flowType, this.credential, this.scopes);
  }
}
