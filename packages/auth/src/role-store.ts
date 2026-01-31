/**
 * Role Store - retrieves roles from S3/DynamoDB based on user/app ID.
 * This abstracts the role storage backend and provides caching.
 */

import { Role, Permission } from './types';

export interface RoleStoreConfig {
  type: 's3' | 'dynamodb' | 'memory';
  bucket?: string;
  table?: string;
  region?: string;
}

interface RoleMapping {
  subjectId: string;
  subjectType: 'user' | 'app';
  roles: Role[];
  updatedAt: Date;
}

export class RoleStore {
  private config: RoleStoreConfig;
  private cache: Map<string, RoleMapping> = new Map();
  private cacheTtlMs: number;

  constructor(config: RoleStoreConfig, cacheTtlMs: number = 300000) {
    this.config = config;
    this.cacheTtlMs = cacheTtlMs;
    
    if (config.type === 'memory') {
      this.seedDemoRoles();
    }
  }

  /**
   * Get roles for a user by their ID (from Entra).
   */
  async getRolesForUser(userId: string): Promise<Role[]> {
    return this.getRoles(userId, 'user');
  }

  /**
   * Get roles for an application by its ID.
   */
  async getRolesForApp(appId: string): Promise<Role[]> {
    return this.getRoles(appId, 'app');
  }

  /**
   * Assign a role to a subject.
   */
  async assignRole(
    subjectId: string, 
    subjectType: 'user' | 'app', 
    role: Role
  ): Promise<void> {
    const key = this.getCacheKey(subjectId, subjectType);
    const existing = this.cache.get(key);
    
    if (existing) {
      if (!existing.roles.find(r => r.id === role.id)) {
        existing.roles.push(role);
        existing.updatedAt = new Date();
      }
    } else {
      this.cache.set(key, {
        subjectId,
        subjectType,
        roles: [role],
        updatedAt: new Date(),
      });
    }

    await this.persistRoles(subjectId, subjectType);
  }

  /**
   * Remove a role from a subject.
   */
  async removeRole(
    subjectId: string, 
    subjectType: 'user' | 'app', 
    roleId: string
  ): Promise<void> {
    const key = this.getCacheKey(subjectId, subjectType);
    const existing = this.cache.get(key);
    
    if (existing) {
      existing.roles = existing.roles.filter(r => r.id !== roleId);
      existing.updatedAt = new Date();
      await this.persistRoles(subjectId, subjectType);
    }
  }

  /**
   * Check if a subject has a specific permission.
   */
  async hasPermission(
    subjectId: string,
    subjectType: 'user' | 'app',
    resource: string,
    action: string
  ): Promise<boolean> {
    const roles = await this.getRoles(subjectId, subjectType);
    
    for (const role of roles) {
      for (const permission of role.permissions) {
        if (permission.resource === resource || permission.resource === '*') {
          if (permission.actions.includes(action as Permission['actions'][0]) || 
              permission.actions.includes('*')) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Get all available roles in the system.
   */
  async getAllRoles(): Promise<Role[]> {
    const allRoles: Role[] = [];
    const seen = new Set<string>();
    
    this.cache.forEach(mapping => {
      for (const role of mapping.roles) {
        if (!seen.has(role.id)) {
          seen.add(role.id);
          allRoles.push(role);
        }
      }
    });
    
    return allRoles;
  }

  private async getRoles(subjectId: string, subjectType: 'user' | 'app'): Promise<Role[]> {
    const key = this.getCacheKey(subjectId, subjectType);
    const cached = this.cache.get(key);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.roles;
    }

    const roles = await this.fetchFromStore(subjectId, subjectType);
    
    this.cache.set(key, {
      subjectId,
      subjectType,
      roles,
      updatedAt: new Date(),
    });
    
    return roles;
  }

  private async fetchFromStore(
    subjectId: string, 
    subjectType: 'user' | 'app'
  ): Promise<Role[]> {
    switch (this.config.type) {
      case 's3':
        return this.fetchFromS3(subjectId, subjectType);
      case 'dynamodb':
        return this.fetchFromDynamoDB(subjectId, subjectType);
      case 'memory':
      default:
        return this.fetchFromMemory(subjectId, subjectType);
    }
  }

  private async fetchFromS3(
    subjectId: string, 
    _subjectType: 'user' | 'app'
  ): Promise<Role[]> {
    // In production, this would use AWS SDK:
    // const s3 = new S3Client({ region: this.config.region });
    // const key = `roles/${subjectType}/${subjectId}.json`;
    // const response = await s3.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
    // return JSON.parse(await response.Body.transformToString());
    
    console.log(`[RoleStore] Would fetch from S3: ${this.config.bucket}/roles/${subjectId}`);
    return this.getDefaultRoles();
  }

  private async fetchFromDynamoDB(
    subjectId: string, 
    _subjectType: 'user' | 'app'
  ): Promise<Role[]> {
    // In production, this would use AWS SDK:
    // const dynamodb = new DynamoDBClient({ region: this.config.region });
    // const response = await dynamodb.send(new GetItemCommand({
    //   TableName: this.config.table,
    //   Key: { subjectId: { S: subjectId }, subjectType: { S: subjectType } }
    // }));
    // return parseRoles(response.Item);
    
    console.log(`[RoleStore] Would fetch from DynamoDB: ${this.config.table}/${subjectId}`);
    return this.getDefaultRoles();
  }

  private async fetchFromMemory(
    subjectId: string, 
    subjectType: 'user' | 'app'
  ): Promise<Role[]> {
    const key = this.getCacheKey(subjectId, subjectType);
    return this.cache.get(key)?.roles ?? this.getDefaultRoles();
  }

  private async persistRoles(
    _subjectId: string, 
    _subjectType: 'user' | 'app'
  ): Promise<void> {
    // In production, persist to S3/DynamoDB
    // For demo, we just keep in memory
  }

  private getCacheKey(subjectId: string, subjectType: 'user' | 'app'): string {
    return `${subjectType}:${subjectId}`;
  }

  private isCacheValid(mapping: RoleMapping): boolean {
    const age = Date.now() - mapping.updatedAt.getTime();
    return age < this.cacheTtlMs;
  }

  private getDefaultRoles(): Role[] {
    return [
      {
        id: 'role-viewer',
        name: 'Viewer',
        description: 'Read-only access to resources',
        scope: 'global',
        permissions: [
          { id: 'perm-read-all', resource: '*', actions: ['read'] },
        ],
      },
    ];
  }

  private seedDemoRoles(): void {
    const adminRole: Role = {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Full access to all resources',
      scope: 'global',
      permissions: [
        { id: 'perm-all', resource: '*', actions: ['*'] },
      ],
    };

    const developerRole: Role = {
      id: 'role-developer',
      name: 'Developer',
      description: 'Access to development resources',
      scope: 'global',
      permissions: [
        { id: 'perm-read-all', resource: '*', actions: ['read'] },
        { id: 'perm-pipelines', resource: 'pipelines', actions: ['create', 'read', 'update', 'execute'] },
        { id: 'perm-errors', resource: 'errors', actions: ['read'] },
        { id: 'perm-telemetry', resource: 'telemetry', actions: ['create', 'read'] },
      ],
    };

    const serviceRole: Role = {
      id: 'role-service',
      name: 'Service Account',
      description: 'Machine-to-machine access',
      scope: 'global',
      permissions: [
        { id: 'perm-api', resource: 'api', actions: ['*'] },
        { id: 'perm-telemetry', resource: 'telemetry', actions: ['create'] },
        { id: 'perm-errors', resource: 'errors', actions: ['create'] },
      ],
    };

    // Seed some demo users
    this.cache.set('user:demo-admin', {
      subjectId: 'demo-admin',
      subjectType: 'user',
      roles: [adminRole],
      updatedAt: new Date(),
    });

    this.cache.set('user:demo-developer', {
      subjectId: 'demo-developer',
      subjectType: 'user',
      roles: [developerRole],
      updatedAt: new Date(),
    });

    this.cache.set('app:demo-service', {
      subjectId: 'demo-service',
      subjectType: 'app',
      roles: [serviceRole],
      updatedAt: new Date(),
    });
  }
}
