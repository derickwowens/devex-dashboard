/**
 * In-memory error store for the dashboard.
 * In production, this would be backed by a database.
 */

import { ErrorReport } from './types';

export class ErrorStore {
  private errors: ErrorReport[] = [];
  private maxSize: number;
  private listeners: Set<(report: ErrorReport) => void> = new Set();

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Add an error report to the store.
   */
  add(report: ErrorReport): void {
    this.errors.unshift(report);
    
    // Trim if over max size
    if (this.errors.length > this.maxSize) {
      this.errors = this.errors.slice(0, this.maxSize);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(report));
  }

  /**
   * Get all errors, optionally filtered.
   */
  getAll(filter?: {
    severity?: string;
    component?: string;
    since?: Date;
    limit?: number;
  }): ErrorReport[] {
    let results = [...this.errors];
    
    if (filter?.severity) {
      results = results.filter(e => e.severity === filter.severity);
    }
    
    if (filter?.component) {
      results = results.filter(e => e.context.component === filter.component);
    }
    
    if (filter?.since) {
      results = results.filter(e => e.timestamp >= filter.since!);
    }
    
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }
    
    return results;
  }

  /**
   * Get error by ID.
   */
  getById(id: string): ErrorReport | undefined {
    return this.errors.find(e => e.id === id);
  }

  /**
   * Get error statistics.
   */
  getStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
    last24Hours: number;
  } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const bySeverity: Record<string, number> = {};
    const byComponent: Record<string, number> = {};
    let last24Hours = 0;
    
    for (const error of this.errors) {
      // By severity
      bySeverity[error.severity] = (bySeverity[error.severity] ?? 0) + 1;
      
      // By component
      const component = error.context.component ?? 'unknown';
      byComponent[component] = (byComponent[component] ?? 0) + 1;
      
      // Last 24 hours
      if (error.timestamp >= oneDayAgo) {
        last24Hours++;
      }
    }
    
    return {
      total: this.errors.length,
      bySeverity,
      byComponent,
      last24Hours,
    };
  }

  /**
   * Subscribe to new errors.
   */
  subscribe(listener: (report: ErrorReport) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear all errors.
   */
  clear(): void {
    this.errors = [];
  }
}
