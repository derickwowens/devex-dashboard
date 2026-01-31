/**
 * @federated/auth
 * 
 * Centralized authentication SDK for the Federated DevEx Platform.
 * Implements Microsoft Entra On-Behalf-Of (OBO) flow with role-based access control.
 * 
 * Architecture:
 * 1. Authenticate through Microsoft Entra (Azure AD)
 * 2. Exchange token for ecosystem-specific roles from role store (S3/DynamoDB)
 * 3. Issue federated tokens for downstream services
 * 4. Handle token refresh and caching transparently
 */

export { AuthPlugin } from './plugin';
export { AuthFluent } from './fluent';
export { 
  AuthConfig,
  AuthToken,
  UserIdentity,
  AppIdentity,
  Role,
  Permission,
  AuthContext,
  TokenClaims
} from './types';
export { RoleStore } from './role-store';
export { TokenManager } from './token-manager';
export { EntraClient } from './entra-client';
