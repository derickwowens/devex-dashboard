/**
 * Token Manager - handles token caching, refresh, and federated token issuance.
 */

import { AuthToken, TokenClaims, Role } from './types';

export interface TokenManagerConfig {
  /** Secret for signing federated tokens (in production, use KMS) */
  signingSecret: string;
  /** Token TTL in seconds */
  tokenTtlSeconds: number;
  /** Refresh threshold (refresh when this % of TTL remains) */
  refreshThreshold: number;
}

interface CachedToken {
  token: AuthToken;
  federatedToken: string;
  roles: Role[];
  cachedAt: Date;
}

export class TokenManager {
  private config: TokenManagerConfig;
  private tokenCache: Map<string, CachedToken> = new Map();

  constructor(config?: Partial<TokenManagerConfig>) {
    this.config = {
      signingSecret: config?.signingSecret ?? 'demo-secret-change-in-production',
      tokenTtlSeconds: config?.tokenTtlSeconds ?? 3600,
      refreshThreshold: config?.refreshThreshold ?? 0.2,
    };
  }

  /**
   * Cache an Entra token and issue a federated token.
   */
  async cacheAndIssue(
    entraToken: AuthToken,
    roles: Role[]
  ): Promise<{ federatedToken: string; expiresAt: Date }> {
    const subjectId = entraToken.claims.sub;
    const federatedToken = await this.issueFederatedToken(entraToken.claims, roles);
    const expiresAt = new Date(Date.now() + this.config.tokenTtlSeconds * 1000);

    this.tokenCache.set(subjectId, {
      token: entraToken,
      federatedToken,
      roles,
      cachedAt: new Date(),
    });

    return { federatedToken, expiresAt };
  }

  /**
   * Get a cached token if valid.
   */
  getCached(subjectId: string): CachedToken | null {
    const cached = this.tokenCache.get(subjectId);
    
    if (!cached) return null;
    
    if (this.isExpired(cached.token)) {
      this.tokenCache.delete(subjectId);
      return null;
    }
    
    return cached;
  }

  /**
   * Check if a token needs refresh.
   */
  needsRefresh(token: AuthToken): boolean {
    const now = Date.now();
    const expiresAt = token.expiresAt.getTime();
    const totalTtl = expiresAt - token.claims.iat * 1000;
    const remaining = expiresAt - now;
    
    return remaining < totalTtl * this.config.refreshThreshold;
  }

  /**
   * Check if a token is expired.
   */
  isExpired(token: AuthToken): boolean {
    return Date.now() >= token.expiresAt.getTime();
  }

  /**
   * Validate a federated token.
   */
  async validateFederatedToken(token: string): Promise<{
    valid: boolean;
    claims?: FederatedTokenClaims;
    error?: string;
  }> {
    try {
      const claims = this.decodeFederatedToken(token);
      
      if (!claims) {
        return { valid: false, error: 'Invalid token format' };
      }
      
      if (claims.exp * 1000 < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }
      
      // In production, verify signature with KMS
      
      return { valid: true, claims };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }

  /**
   * Revoke a token.
   */
  revoke(subjectId: string): void {
    this.tokenCache.delete(subjectId);
  }

  /**
   * Clear all cached tokens.
   */
  clearAll(): void {
    this.tokenCache.clear();
  }

  /**
   * Issue a federated token for ecosystem use.
   */
  private async issueFederatedToken(
    entraClaims: TokenClaims,
    roles: Role[]
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    
    const claims: FederatedTokenClaims = {
      sub: entraClaims.sub,
      iss: 'federated-devex-platform',
      aud: 'federated-ecosystem',
      iat: now,
      exp: now + this.config.tokenTtlSeconds,
      jti: this.generateTokenId(),
      // Original Entra claims
      entra: {
        oid: entraClaims.oid,
        tid: entraClaims.tid,
        upn: entraClaims.upn,
        name: entraClaims.name,
        email: entraClaims.email,
      },
      // Federated roles
      roles: roles.map(r => r.id),
      permissions: this.flattenPermissions(roles),
    };

    // In production, sign with KMS
    // For demo, we use a simple base64 encoding
    return this.encodeToken(claims);
  }

  private flattenPermissions(roles: Role[]): string[] {
    const permissions = new Set<string>();
    
    for (const role of roles) {
      for (const perm of role.permissions) {
        for (const action of perm.actions) {
          permissions.add(`${perm.resource}:${action}`);
        }
      }
    }
    
    return Array.from(permissions);
  }

  private encodeToken(claims: FederatedTokenClaims): string {
    // In production, use proper JWT signing with RS256/ES256
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = this.sign(`${headerB64}.${payloadB64}`);
    
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  private decodeFederatedToken(token: string): FederatedTokenClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  private sign(data: string): string {
    // In production, use crypto.createHmac or KMS
    // For demo, simple hash
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.config.signingSecret)
      .update(data)
      .digest('base64url');
  }

  private generateTokenId(): string {
    return `fed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface FederatedTokenClaims {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
  entra: {
    oid?: string;
    tid?: string;
    upn?: string;
    name?: string;
    email?: string;
  };
  roles: string[];
  permissions: string[];
}
