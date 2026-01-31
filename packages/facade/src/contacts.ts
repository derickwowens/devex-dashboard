/**
 * Contacts module for address book functionality.
 * Provides fluent API for managing organizational contacts.
 */

export type ContactType = 'internal' | 'external' | 'vendor' | 'partner';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  organization: string;
  type: ContactType;
  tags: string[];
  avatar?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFilter {
  query?: string;
  type?: ContactType;
  organization?: string;
  department?: string;
  tags?: string[];
}

export class ContactsStore {
  private contacts: Contact[] = [];
  private listeners: Set<(contact: Contact) => void> = new Set();

  constructor() {
    this.seedDemoData();
  }

  add(contact: Contact): void {
    this.contacts.push(contact);
    this.listeners.forEach(l => l(contact));
  }

  update(id: string, updates: Partial<Contact>): Contact | undefined {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    
    this.contacts[index] = { 
      ...this.contacts[index], 
      ...updates,
      updatedAt: new Date(),
    };
    return this.contacts[index];
  }

  delete(id: string): boolean {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.contacts.splice(index, 1);
    return true;
  }

  getAll(filter?: ContactFilter): Contact[] {
    let results = [...this.contacts];

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q)
      );
    }
    if (filter?.type) {
      results = results.filter(c => c.type === filter.type);
    }
    if (filter?.organization) {
      results = results.filter(c => 
        c.organization.toLowerCase().includes(filter.organization!.toLowerCase())
      );
    }
    if (filter?.department) {
      results = results.filter(c => c.department === filter.department);
    }
    if (filter?.tags?.length) {
      results = results.filter(c => 
        filter.tags!.some(tag => c.tags.includes(tag))
      );
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  getStats(): {
    total: number;
    byType: Record<ContactType, number>;
    byOrganization: Record<string, number>;
  } {
    const byType: Record<ContactType, number> = {
      internal: 0,
      external: 0,
      vendor: 0,
      partner: 0,
    };
    const byOrganization: Record<string, number> = {};

    for (const c of this.contacts) {
      byType[c.type]++;
      byOrganization[c.organization] = (byOrganization[c.organization] ?? 0) + 1;
    }

    return {
      total: this.contacts.length,
      byType,
      byOrganization,
    };
  }

  subscribe(listener: (contact: Contact) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private seedDemoData(): void {
    const now = new Date();
    
    const demoContacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'John Martinez',
        email: 'john.martinez@company.com',
        title: 'Senior Engineer',
        department: 'Platform',
        organization: 'Engineering',
        type: 'internal',
        tags: ['platform', 'backend'],
      },
      {
        name: 'Sarah Kim',
        email: 'sarah.kim@company.com',
        title: 'Tech Lead',
        department: 'Game Engine',
        organization: 'Engineering',
        type: 'internal',
        tags: ['game-engine', 'graphics'],
      },
      {
        name: 'Mike Johnson',
        email: 'mike.j@vendor.com',
        title: 'Account Manager',
        organization: 'AWS',
        type: 'vendor',
        tags: ['cloud', 'infrastructure'],
      },
      {
        name: 'Emily Chen',
        email: 'emily.chen@partner.com',
        title: 'Integration Lead',
        organization: 'Partner Studio',
        type: 'partner',
        tags: ['integration', 'sdk'],
      },
      {
        name: 'David Wilson',
        email: 'david.w@company.com',
        title: 'DevOps Engineer',
        department: 'Infrastructure',
        organization: 'Engineering',
        type: 'internal',
        tags: ['devops', 'ci-cd'],
      },
    ];

    demoContacts.forEach((c, i) => {
      this.contacts.push({
        ...c,
        id: `contact-${i + 1}`,
        createdAt: new Date(now.getTime() - i * 86400000),
        updatedAt: now,
      });
    });
  }
}

export class ContactsFluent {
  private store: ContactsStore;
  private filter: ContactFilter = {};
  private limitCount?: number;

  constructor(store: ContactsStore) {
    this.store = store;
  }

  /**
   * Search contacts by name, email, or organization.
   */
  search(query: string): this {
    this.filter.query = query;
    return this;
  }

  /**
   * Filter by contact type.
   */
  type(type: ContactType): this {
    this.filter.type = type;
    return this;
  }

  /**
   * Filter by organization.
   */
  inOrg(organization: string): this {
    this.filter.organization = organization;
    return this;
  }

  /**
   * Filter by department.
   */
  inDepartment(department: string): this {
    this.filter.department = department;
    return this;
  }

  /**
   * Filter by tags.
   */
  withTags(...tags: string[]): this {
    this.filter.tags = tags;
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
  execute(): Contact[] {
    let results = this.store.getAll(this.filter);
    if (this.limitCount) {
      results = results.slice(0, this.limitCount);
    }
    this.reset();
    return results;
  }

  /**
   * Get a single contact by ID.
   */
  get(id: string): Contact | undefined {
    return this.store.getById(id);
  }

  /**
   * Get contact statistics.
   */
  stats(): ReturnType<ContactsStore['getStats']> {
    return this.store.getStats();
  }

  /**
   * Create a new contact.
   */
  create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.add(newContact);
    return newContact;
  }

  /**
   * Update a contact.
   */
  update(id: string, updates: Partial<Contact>): Contact | undefined {
    return this.store.update(id, updates);
  }

  /**
   * Delete a contact.
   */
  delete(id: string): boolean {
    return this.store.delete(id);
  }

  private reset(): void {
    this.filter = {};
    this.limitCount = undefined;
  }
}
