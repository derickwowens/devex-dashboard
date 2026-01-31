/**
 * Authentication types for the federated ecosystem.
 */

export interface AuthConfig {
  /** Microsoft Entra tenant ID */
  tenantId: string;
  /** Application (client) ID */
  clientId: string;
  /** Client secret (for confidential clients) */
  clientSecret?: string;
  /** Redirect URI for auth flow */
  redirectUri?: string;
  /** Scopes to request */
  scopes: string[];
  /** Role store configuration */
  roleStore: {
    type: 's3' | 'dynamodb' | 'memory';
    bucket?: string;
    table?: string;
    region?: string;
  };
  /** Token cache configuration */
  cache: {
    enabled: boolean;
    ttlSeconds: number;
  };
  /** Environment */
  environment: 'development' | 'staging' | 'production';
}

export interface TokenClaims {
  /** Subject (user or app ID) */
  sub: string;
  /** Audience */
  aud: string;
  /** Issuer */
  iss: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Not before timestamp */
  nbf?: number;
  /** Token ID */
  jti?: string;
  /** User principal name */
  upn?: string;
  /** Email */
  email?: string;
  /** Name */
  name?: string;
  /** Object ID (Azure AD) */
  oid?: string;
  /** Tenant ID */
  tid?: string;
  /** Application ID (for app tokens) */
  appid?: string;
  /** Roles from Entra */
  roles?: string[];
}

export interface AuthToken {
  /** Access token */
  accessToken: string;
  /** Token type (usually "Bearer") */
  tokenType: string;
  /** Expiration time */
  expiresAt: Date;
  /** Refresh token (if available) */
  refreshToken?: string;
  /** ID token (if available) */
  idToken?: string;
  /** Scopes granted */
  scopes: string[];
  /** Decoded claims */
  claims: TokenClaims;
}

export interface Role {
  /** Role ID */
  id: string;
  /** Role name */
  name: string;
  /** Role description */
  description?: string;
  /** Permissions granted by this role */
  permissions: Permission[];
  /** Scope of the role (global, project, team) */
  scope: 'global' | 'project' | 'team';
  /** Scope ID (project ID, team ID, etc.) */
  scopeId?: string;
}

export interface Permission {
  /** Permission ID */
  id: string;
  /** Resource type */
  resource: string;
  /** Actions allowed */
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute' | '*')[];
  /** Conditions for the permission */
  conditions?: Record<string, unknown>;
}

export interface UserIdentity {
  /** User ID (from Entra) */
  id: string;
  /** Object ID (Azure AD) */
  objectId: string;
  /** User principal name */
  upn: string;
  /** Display name */
  displayName: string;
  /** Email */
  email?: string;
  /** Tenant ID */
  tenantId: string;
  /** Roles assigned to this user */
  roles: Role[];
  /** Raw Entra token */
  entraToken: AuthToken;
  /** Federated ecosystem token */
  federatedToken: string;
}

export interface AppIdentity {
  /** Application ID */
  id: string;
  /** Application name */
  name: string;
  /** Tenant ID */
  tenantId: string;
  /** Roles assigned to this app */
  roles: Role[];
  /** Raw Entra token */
  entraToken: AuthToken;
  /** Federated ecosystem token */
  federatedToken: string;
}

export interface AuthContext {
  /** Whether the context is for a user or app */
  type: 'user' | 'app';
  /** The identity */
  identity: UserIdentity | AppIdentity;
  /** Current token */
  token: AuthToken;
  /** Whether the token is expired */
  isExpired: boolean;
  /** Time until expiration */
  expiresIn: number;
}

export interface AuthResult {
  success: boolean;
  context?: AuthContext;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
