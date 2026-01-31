/**
 * Pipelines module for GitLab/CI integration.
 * Provides fluent API for managing and querying pipelines.
 */

export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped';

export interface Pipeline {
  id: string;
  projectId: string;
  projectName: string;
  ref: string;
  sha: string;
  status: PipelineStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  stages: PipelineStage[];
}

export interface PipelineStage {
  name: string;
  status: PipelineStatus;
  jobs: PipelineJob[];
}

export interface PipelineJob {
  id: string;
  name: string;
  status: PipelineStatus;
  duration?: number;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface PipelineFilter {
  status?: PipelineStatus | PipelineStatus[];
  projectId?: string;
  ref?: string;
  userId?: string;
  since?: Date;
}

export class PipelinesStore {
  private pipelines: Pipeline[] = [];
  private listeners: Set<(pipeline: Pipeline) => void> = new Set();

  constructor() {
    this.seedDemoData();
  }

  add(pipeline: Pipeline): void {
    this.pipelines.unshift(pipeline);
    this.listeners.forEach(l => l(pipeline));
  }

  update(id: string, updates: Partial<Pipeline>): Pipeline | undefined {
    const index = this.pipelines.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.pipelines[index] = { ...this.pipelines[index], ...updates };
    return this.pipelines[index];
  }

  getAll(filter?: PipelineFilter): Pipeline[] {
    let results = [...this.pipelines];

    if (filter?.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      results = results.filter(p => statuses.includes(p.status));
    }
    if (filter?.projectId) {
      results = results.filter(p => p.projectId === filter.projectId);
    }
    if (filter?.ref) {
      results = results.filter(p => p.ref === filter.ref);
    }
    if (filter?.userId) {
      results = results.filter(p => p.user.id === filter.userId);
    }
    if (filter?.since) {
      results = results.filter(p => p.createdAt >= filter.since!);
    }

    return results;
  }

  getById(id: string): Pipeline | undefined {
    return this.pipelines.find(p => p.id === id);
  }

  getStats(): {
    total: number;
    byStatus: Record<PipelineStatus, number>;
    avgDuration: number;
    successRate: number;
  } {
    const byStatus: Record<PipelineStatus, number> = {
      pending: 0,
      running: 0,
      success: 0,
      failed: 0,
      canceled: 0,
      skipped: 0,
    };

    let totalDuration = 0;
    let durationCount = 0;
    let successCount = 0;
    let completedCount = 0;

    for (const p of this.pipelines) {
      byStatus[p.status]++;
      if (p.duration) {
        totalDuration += p.duration;
        durationCount++;
      }
      if (p.status === 'success' || p.status === 'failed') {
        completedCount++;
        if (p.status === 'success') successCount++;
      }
    }

    return {
      total: this.pipelines.length,
      byStatus,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      successRate: completedCount > 0 ? successCount / completedCount : 0,
    };
  }

  subscribe(listener: (pipeline: Pipeline) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private seedDemoData(): void {
    const now = new Date();
    const projects = [
      { id: 'proj-1', name: 'game-engine' },
      { id: 'proj-2', name: 'player-service' },
      { id: 'proj-3', name: 'matchmaking-api' },
    ];
    const users = [
      { id: 'user-1', name: 'Alice Chen', avatar: undefined },
      { id: 'user-2', name: 'Bob Smith', avatar: undefined },
      { id: 'user-3', name: 'Carol Davis', avatar: undefined },
    ];
    const statuses: PipelineStatus[] = ['success', 'success', 'failed', 'running', 'pending'];

    for (let i = 0; i < 10; i++) {
      const project = projects[i % projects.length];
      const user = users[i % users.length];
      const status = statuses[i % statuses.length];
      const createdAt = new Date(now.getTime() - i * 3600000);

      this.pipelines.push({
        id: `pipeline-${i + 1}`,
        projectId: project.id,
        projectName: project.name,
        ref: 'main',
        sha: `abc${i}def`,
        status,
        source: 'push',
        createdAt,
        updatedAt: createdAt,
        startedAt: status !== 'pending' ? createdAt : undefined,
        finishedAt: ['success', 'failed'].includes(status) 
          ? new Date(createdAt.getTime() + 300000) 
          : undefined,
        duration: ['success', 'failed'].includes(status) ? 300 : undefined,
        user,
        stages: [
          { name: 'build', status: status === 'pending' ? 'pending' : 'success', jobs: [] },
          { name: 'test', status, jobs: [] },
          { name: 'deploy', status: status === 'success' ? 'success' : 'skipped', jobs: [] },
        ],
      });
    }
  }
}

export class PipelinesFluent {
  private store: PipelinesStore;
  private filter: PipelineFilter = {};
  private limitCount?: number;

  constructor(store: PipelinesStore) {
    this.store = store;
  }

  /**
   * List pipelines.
   */
  list(): this {
    return this;
  }

  /**
   * Filter by status.
   */
  status(status: PipelineStatus | PipelineStatus[]): this {
    this.filter.status = status;
    return this;
  }

  /**
   * Filter by project.
   */
  project(projectId: string): this {
    this.filter.projectId = projectId;
    return this;
  }

  /**
   * Filter by branch/ref.
   */
  ref(ref: string): this {
    this.filter.ref = ref;
    return this;
  }

  /**
   * Filter by user.
   */
  user(userId: string): this {
    this.filter.userId = userId;
    return this;
  }

  /**
   * Filter by date.
   */
  since(date: Date): this {
    this.filter.since = date;
    return this;
  }

  /**
   * Limit results.
   */
  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  /**
   * Execute the query.
   */
  execute(): Pipeline[] {
    let results = this.store.getAll(this.filter);
    if (this.limitCount) {
      results = results.slice(0, this.limitCount);
    }
    this.reset();
    return results;
  }

  /**
   * Get a single pipeline by ID.
   */
  get(id: string): Pipeline | undefined {
    return this.store.getById(id);
  }

  /**
   * Get pipeline statistics.
   */
  stats(): ReturnType<PipelinesStore['getStats']> {
    return this.store.getStats();
  }

  /**
   * Trigger a new pipeline (mock).
   */
  async trigger(projectId: string, ref: string = 'main'): Promise<Pipeline> {
    const pipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      projectId,
      projectName: projectId,
      ref,
      sha: Math.random().toString(36).substr(2, 7),
      status: 'pending',
      source: 'api',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: 'current-user', name: 'Current User' },
      stages: [],
    };
    this.store.add(pipeline);
    return pipeline;
  }

  private reset(): void {
    this.filter = {};
    this.limitCount = undefined;
  }
}
