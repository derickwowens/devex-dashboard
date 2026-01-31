/**
 * Entra Client - handles Microsoft Entra (Azure AD) authentication.
 * Implements the On-Behalf-Of (OBO) flow for token exchange.
 */

import { AuthConfig, AuthToken, TokenClaims } from './types';

export interface EntraClientConfig {
  tenantId: string;
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes: string[];
}

export class EntraClient {
  private config: EntraClientConfig;
  private baseUrl: string;

  constructor(config: EntraClientConfig) {
    this.config = config;
    this.baseUrl = `https://login.microsoftonline.com/${config.tenantId}`;
  }

  /**
   * Get the authorization URL for interactive login.
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri ?? 'http://localhost:3000/auth/callback',
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      state: state ?? this.generateState(),
    });

    return `${this.baseUrl}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens.
   */
  async exchangeCodeForToken(code: string): Promise<AuthToken> {
    const tokenEndpoint = `${this.baseUrl}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      code,
      redirect_uri: this.config.redirectUri ?? 'http://localhost:3000/auth/callback',
      grant_type: 'authorization_code',
    });

    if (this.config.clientSecret) {
      body.append('client_secret', this.config.clientSecret);
    }

    // In production, make actual HTTP request
    // const response = await fetch(tokenEndpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: body.toString(),
    // });
    // const data = await response.json();

    // For demo, return mock token
    console.log(`[EntraClient] Would exchange code at: ${tokenEndpoint}`);
    return this.createMockToken('user');
  }

  /**
   * On-Behalf-Of flow - exchange user token for downstream service token.
   */
  async onBehalfOf(userToken: string, scopes: string[]): Promise<AuthToken> {
    const tokenEndpoint = `${this.baseUrl}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      scope: scopes.join(' '),
      assertion: userToken,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      requested_token_use: 'on_behalf_of',
    });

    if (this.config.clientSecret) {
      body.append('client_secret', this.config.clientSecret);
    }

    // In production, make actual HTTP request
    console.log(`[EntraClient] Would perform OBO at: ${tokenEndpoint}`);
    return this.createMockToken('user');
  }

  /**
   * Client credentials flow - for app-to-app authentication.
   */
  async clientCredentials(scopes: string[]): Promise<AuthToken> {
    const tokenEndpoint = `${this.baseUrl}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      scope: scopes.join(' '),
      grant_type: 'client_credentials',
    });

    if (this.config.clientSecret) {
      body.append('client_secret', this.config.clientSecret);
    }

    // In production, make actual HTTP request
    console.log(`[EntraClient] Would get client credentials at: ${tokenEndpoint}`);
    return this.createMockToken('app');
  }

  /**
   * Refresh an access token.
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const tokenEndpoint = `${this.baseUrl}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    if (this.config.clientSecret) {
      body.append('client_secret', this.config.clientSecret);
    }

    // In production, make actual HTTP request
    console.log(`[EntraClient] Would refresh token at: ${tokenEndpoint}`);
    return this.createMockToken('user');
  }

  /**
   * Validate a token with Microsoft.
   */
  async validateToken(token: string): Promise<{ valid: boolean; claims?: TokenClaims }> {
    // In production, validate JWT signature against Microsoft's public keys
    // const keys = await this.getSigningKeys();
    // const decoded = jwt.verify(token, keys);
    
    console.log(`[EntraClient] Would validate token`);
    
    // For demo, decode without verification
    try {
      const claims = this.decodeToken(token);
      return { valid: true, claims };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Get user info from Microsoft Graph.
   */
  async getUserInfo(accessToken: string): Promise<{
    id: string;
    displayName: string;
    mail: string;
    userPrincipalName: string;
  }> {
    // In production:
    // const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    //   headers: { Authorization: `Bearer ${accessToken}` },
    // });
    // return response.json();

    console.log(`[EntraClient] Would fetch user info from Graph API`);
    
    return {
      id: 'demo-user-id',
      displayName: 'Demo User',
      mail: 'demo@company.com',
      userPrincipalName: 'demo@company.com',
    };
  }

  private createMockToken(type: 'user' | 'app'): AuthToken {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600;

    const claims: TokenClaims = {
      sub: type === 'user' ? 'demo-user-id' : 'demo-app-id',
      aud: this.config.clientId,
      iss: `https://login.microsoftonline.com/${this.config.tenantId}/v2.0`,
      iat: now,
      exp: now + expiresIn,
      nbf: now,
      jti: `token_${Date.now()}`,
      oid: type === 'user' ? 'demo-user-oid' : 'demo-app-oid',
      tid: this.config.tenantId,
      ...(type === 'user' ? {
        upn: 'demo@company.com',
        email: 'demo@company.com',
        name: 'Demo User',
      } : {
        appid: this.config.clientId,
      }),
    };

    return {
      accessToken: this.encodeToken(claims),
      tokenType: 'Bearer',
      expiresAt: new Date((now + expiresIn) * 1000),
      refreshToken: type === 'user' ? 'demo-refresh-token' : undefined,
      scopes: this.config.scopes,
      claims,
    };
  }

  private encodeToken(claims: TokenClaims): string {
    const header = { alg: 'RS256', typ: 'JWT' };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(claims)).toString('base64url');
    return `${headerB64}.${payloadB64}.demo-signature`;
  }

  private decodeToken(token: string): TokenClaims {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  }

  private generateState(): string {
    return Math.random().toString(36).substr(2, 16);
  }
}
