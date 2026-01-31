/**
 * Documentation module for the Federated Facade.
 * Provides access to federated documentation data across projects.
 */

export interface Document {
  id: string;
  name: string;
  title: string;
  description?: string;
  url: string;
  type: DocumentType;
  projectId?: string;
  packageName?: string;
  version?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  status: 'draft' | 'published' | 'archived';
}

export type DocumentType = 
  | 'api-reference'
  | 'guide'
  | 'tutorial'
  | 'architecture'
  | 'adr'
  | 'runbook'
  | 'changelog'
  | 'readme';

export interface DocumentLink {
  id: string;
  documentId: string;
  linkedEntityType: 'pipeline' | 'project' | 'package' | 'error' | 'contact';
  linkedEntityId: string;
  relationship: 'documents' | 'references' | 'related-to';
  createdAt: Date;
}

export interface DocumentBuild {
  id: string;
  documentId: string;
  buildId: string;
  pipelineId?: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  builtAt?: Date;
  buildDuration?: number;
  artifactUrl?: string;
}

export interface DocumentSearchResult {
  document: Document;
  score: number;
  highlights: {
    field: string;
    snippet: string;
  }[];
}

/**
 * In-memory documentation store.
 * In production, this would be backed by DynamoDB/S3.
 */
export class DocumentationStore {
  private documents: Map<string, Document> = new Map();
  private links: Map<string, DocumentLink> = new Map();
  private builds: Map<string, DocumentBuild> = new Map();

  constructor() {
    this.seedDemoData();
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) ?? null;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async searchDocuments(query: string): Promise<DocumentSearchResult[]> {
    const results: DocumentSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const doc of this.documents.values()) {
      let score = 0;
      const highlights: { field: string; snippet: string }[] = [];

      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 10;
        highlights.push({ field: 'title', snippet: doc.title });
      }
      if (doc.description?.toLowerCase().includes(queryLower)) {
        score += 5;
        highlights.push({ field: 'description', snippet: doc.description });
      }
      if (doc.tags.some(t => t.toLowerCase().includes(queryLower))) {
        score += 3;
        highlights.push({ field: 'tags', snippet: doc.tags.join(', ') });
      }

      if (score > 0) {
        results.push({ document: doc, score, highlights });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(d => d.projectId === projectId);
  }

  async getDocumentsByPackage(packageName: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(d => d.packageName === packageName);
  }

  async getDocumentsByType(type: DocumentType): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(d => d.type === type);
  }

  async getLinksForDocument(documentId: string): Promise<DocumentLink[]> {
    return Array.from(this.links.values())
      .filter(l => l.documentId === documentId);
  }

  async getLinksForEntity(
    entityType: DocumentLink['linkedEntityType'],
    entityId: string
  ): Promise<DocumentLink[]> {
    return Array.from(this.links.values())
      .filter(l => l.linkedEntityType === entityType && l.linkedEntityId === entityId);
  }

  async getBuildsForDocument(documentId: string): Promise<DocumentBuild[]> {
    return Array.from(this.builds.values())
      .filter(b => b.documentId === documentId);
  }

  async createDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const document: Document = {
      ...doc,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const updated = {
      ...doc,
      ...updates,
      id: doc.id,
      createdAt: doc.createdAt,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async createLink(link: Omit<DocumentLink, 'id' | 'createdAt'>): Promise<DocumentLink> {
    const id = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const documentLink: DocumentLink = {
      ...link,
      id,
      createdAt: new Date(),
    };
    this.links.set(id, documentLink);
    return documentLink;
  }

  async recordBuild(build: Omit<DocumentBuild, 'id'>): Promise<DocumentBuild> {
    const id = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const documentBuild: DocumentBuild = {
      ...build,
      id,
    };
    this.builds.set(id, documentBuild);
    return documentBuild;
  }

  private seedDemoData(): void {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const lastWeek = new Date(now.getTime() - 604800000);

    const demoDocuments: Document[] = [
      {
        id: 'doc-auth-guide',
        name: 'authentication-guide',
        title: 'Authentication Guide',
        description: 'Complete guide to implementing authentication with Microsoft Entra OBO flow',
        url: '/docs/sdk/auth',
        type: 'guide',
        packageName: '@federated/auth',
        version: '1.0.0',
        tags: ['auth', 'entra', 'obo', 'security'],
        createdAt: lastWeek,
        updatedAt: yesterday,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-error-handling',
        name: 'error-handling-reference',
        title: 'Error Handling API Reference',
        description: 'API reference for the centralized error handling SDK',
        url: '/docs/sdk/error-handling',
        type: 'api-reference',
        packageName: '@federated/error-handling',
        version: '1.0.0',
        tags: ['errors', 'api', 'reference'],
        createdAt: lastWeek,
        updatedAt: now,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-getting-started',
        name: 'getting-started',
        title: 'Getting Started',
        description: 'Quick start guide to the Federated DevEx Platform',
        url: '/docs/getting-started/quick-start',
        type: 'tutorial',
        tags: ['quickstart', 'tutorial', 'beginner'],
        createdAt: lastWeek,
        updatedAt: yesterday,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-architecture',
        name: 'architecture-patterns',
        title: 'Architecture Patterns',
        description: 'Recommended architecture patterns for the platform',
        url: '/docs/architecture/patterns',
        type: 'architecture',
        tags: ['architecture', 'patterns', 'design'],
        createdAt: lastWeek,
        updatedAt: lastWeek,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-pipeline-runbook',
        name: 'pipeline-runbook',
        title: 'Pipeline Troubleshooting Runbook',
        description: 'Step-by-step guide for troubleshooting CI/CD pipeline issues',
        url: '/docs/runbooks/pipelines',
        type: 'runbook',
        projectId: 'game-engine',
        tags: ['runbook', 'pipelines', 'troubleshooting', 'ci-cd'],
        createdAt: yesterday,
        updatedAt: now,
        createdBy: 'alice.chen',
        status: 'published',
      },
      {
        id: 'doc-adr-001',
        name: 'adr-001-fluent-facade',
        title: 'ADR-001: Fluent Facade Pattern',
        description: 'Architecture decision record for adopting the fluent facade pattern',
        url: '/docs/architecture/adr/001-fluent-facade',
        type: 'adr',
        tags: ['adr', 'architecture', 'facade', 'decision'],
        createdAt: lastWeek,
        updatedAt: lastWeek,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-telemetry-guide',
        name: 'telemetry-integration',
        title: 'Telemetry Integration Guide',
        description: 'How to integrate telemetry into your services',
        url: '/docs/sdk/telemetry',
        type: 'guide',
        packageName: '@federated/telemetry',
        version: '1.0.0',
        tags: ['telemetry', 'metrics', 'tracing', 'observability'],
        createdAt: lastWeek,
        updatedAt: yesterday,
        createdBy: 'system',
        status: 'published',
      },
      {
        id: 'doc-ui-config',
        name: 'ui-configuration',
        title: 'UI Configuration Reference',
        description: 'Reference for the centralized UI configuration system',
        url: '/docs/sdk/ui-config',
        type: 'api-reference',
        packageName: '@federated/ui-config',
        version: '1.0.0',
        tags: ['ui', 'components', 'design-system', 'configuration'],
        createdAt: lastWeek,
        updatedAt: now,
        createdBy: 'system',
        status: 'published',
      },
    ];

    for (const doc of demoDocuments) {
      this.documents.set(doc.id, doc);
    }

    // Demo links
    const demoLinks: DocumentLink[] = [
      {
        id: 'link-1',
        documentId: 'doc-pipeline-runbook',
        linkedEntityType: 'pipeline',
        linkedEntityId: 'pipeline-1',
        relationship: 'documents',
        createdAt: now,
      },
      {
        id: 'link-2',
        documentId: 'doc-auth-guide',
        linkedEntityType: 'package',
        linkedEntityId: '@federated/auth',
        relationship: 'documents',
        createdAt: now,
      },
      {
        id: 'link-3',
        documentId: 'doc-error-handling',
        linkedEntityType: 'package',
        linkedEntityId: '@federated/error-handling',
        relationship: 'documents',
        createdAt: now,
      },
    ];

    for (const link of demoLinks) {
      this.links.set(link.id, link);
    }

    // Demo builds
    const demoBuilds: DocumentBuild[] = [
      {
        id: 'build-1',
        documentId: 'doc-auth-guide',
        buildId: 'docs-build-123',
        pipelineId: 'pipeline-docs',
        status: 'success',
        builtAt: yesterday,
        buildDuration: 45000,
        artifactUrl: 'https://docs.example.com/auth-guide',
      },
      {
        id: 'build-2',
        documentId: 'doc-getting-started',
        buildId: 'docs-build-124',
        pipelineId: 'pipeline-docs',
        status: 'success',
        builtAt: now,
        buildDuration: 32000,
        artifactUrl: 'https://docs.example.com/getting-started',
      },
    ];

    for (const build of demoBuilds) {
      this.builds.set(build.id, build);
    }
  }
}

/**
 * Fluent API for documentation operations.
 */
export class DocumentationFluent {
  private store: DocumentationStore;
  private filters: {
    type?: DocumentType;
    projectId?: string;
    packageName?: string;
    tags?: string[];
    status?: Document['status'];
  } = {};
  private searchQuery?: string;
  private limitCount?: number;

  constructor(store: DocumentationStore) {
    this.store = store;
  }

  /**
   * Search documents by query.
   */
  search(query: string): this {
    this.searchQuery = query;
    return this;
  }

  /**
   * Filter by document type.
   */
  type(type: DocumentType): this {
    this.filters.type = type;
    return this;
  }

  /**
   * Filter by project.
   */
  forProject(projectId: string): this {
    this.filters.projectId = projectId;
    return this;
  }

  /**
   * Filter by package.
   */
  forPackage(packageName: string): this {
    this.filters.packageName = packageName;
    return this;
  }

  /**
   * Filter by tags.
   */
  withTags(...tags: string[]): this {
    this.filters.tags = tags;
    return this;
  }

  /**
   * Filter by status.
   */
  status(status: Document['status']): this {
    this.filters.status = status;
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
  async execute(): Promise<Document[]> {
    let results: Document[];

    if (this.searchQuery) {
      const searchResults = await this.store.searchDocuments(this.searchQuery);
      results = searchResults.map(r => r.document);
    } else {
      results = await this.store.getAllDocuments();
    }

    // Apply filters
    if (this.filters.type) {
      results = results.filter(d => d.type === this.filters.type);
    }
    if (this.filters.projectId) {
      results = results.filter(d => d.projectId === this.filters.projectId);
    }
    if (this.filters.packageName) {
      results = results.filter(d => d.packageName === this.filters.packageName);
    }
    if (this.filters.tags && this.filters.tags.length > 0) {
      results = results.filter(d => 
        this.filters.tags!.some(tag => d.tags.includes(tag))
      );
    }
    if (this.filters.status) {
      results = results.filter(d => d.status === this.filters.status);
    }

    // Apply limit
    if (this.limitCount) {
      results = results.slice(0, this.limitCount);
    }

    return results;
  }

  /**
   * Get a single document by ID.
   */
  async get(id: string): Promise<Document | null> {
    return this.store.getDocument(id);
  }

  /**
   * Get documents linked to an entity.
   */
  async linkedTo(
    entityType: DocumentLink['linkedEntityType'],
    entityId: string
  ): Promise<Document[]> {
    const links = await this.store.getLinksForEntity(entityType, entityId);
    const docs: Document[] = [];
    
    for (const link of links) {
      const doc = await this.store.getDocument(link.documentId);
      if (doc) docs.push(doc);
    }
    
    return docs;
  }

  /**
   * Get build history for a document.
   */
  async builds(documentId: string): Promise<DocumentBuild[]> {
    return this.store.getBuildsForDocument(documentId);
  }

  /**
   * Create a new document.
   */
  async create(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    return this.store.createDocument(doc);
  }

  /**
   * Link a document to an entity.
   */
  async link(
    documentId: string,
    entityType: DocumentLink['linkedEntityType'],
    entityId: string,
    relationship: DocumentLink['relationship'] = 'documents'
  ): Promise<DocumentLink> {
    return this.store.createLink({
      documentId,
      linkedEntityType: entityType,
      linkedEntityId: entityId,
      relationship,
    });
  }
}
