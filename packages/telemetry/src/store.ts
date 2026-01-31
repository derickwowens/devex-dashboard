/**
 * In-memory metrics store for the dashboard.
 */

import { Metric, Span, TelemetryEvent } from './types';

export class MetricsStore {
  private metrics: Metric[] = [];
  private spans: Span[] = [];
  private maxSize: number;
  private listeners: Set<(event: TelemetryEvent) => void> = new Set();

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Add a metric to the store.
   */
  addMetric(metric: Metric): void {
    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxSize) {
      this.metrics = this.metrics.slice(0, this.maxSize);
    }
    this.notify({ type: 'metric', data: metric, timestamp: new Date() });
  }

  /**
   * Add a span to the store.
   */
  addSpan(span: Span): void {
    this.spans.unshift(span);
    if (this.spans.length > this.maxSize) {
      this.spans = this.spans.slice(0, this.maxSize);
    }
    this.notify({ type: 'span', data: span, timestamp: new Date() });
  }

  /**
   * Get metrics, optionally filtered.
   */
  getMetrics(filter?: {
    name?: string;
    type?: string;
    component?: string;
    since?: Date;
    limit?: number;
  }): Metric[] {
    let results = [...this.metrics];

    if (filter?.name) {
      results = results.filter(m => m.name.includes(filter.name!));
    }
    if (filter?.type) {
      results = results.filter(m => m.type === filter.type);
    }
    if (filter?.component) {
      results = results.filter(m => m.component === filter.component);
    }
    if (filter?.since) {
      results = results.filter(m => m.timestamp >= filter.since!);
    }
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Get spans, optionally filtered.
   */
  getSpans(filter?: {
    traceId?: string;
    name?: string;
    status?: string;
    limit?: number;
  }): Span[] {
    let results = [...this.spans];

    if (filter?.traceId) {
      results = results.filter(s => s.traceId === filter.traceId);
    }
    if (filter?.name) {
      results = results.filter(s => s.name.includes(filter.name!));
    }
    if (filter?.status) {
      results = results.filter(s => s.status === filter.status);
    }
    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Get aggregated metrics stats.
   */
  getStats(): {
    totalMetrics: number;
    totalSpans: number;
    avgLatency: number;
    errorRate: number;
  } {
    const timerMetrics = this.metrics.filter(m => m.type === 'timer');
    const avgLatency = timerMetrics.length > 0
      ? timerMetrics.reduce((sum, m) => sum + m.value, 0) / timerMetrics.length
      : 0;

    const errorSpans = this.spans.filter(s => s.status === 'error').length;
    const errorRate = this.spans.length > 0 ? errorSpans / this.spans.length : 0;

    return {
      totalMetrics: this.metrics.length,
      totalSpans: this.spans.length,
      avgLatency,
      errorRate,
    };
  }

  /**
   * Subscribe to new telemetry events.
   */
  subscribe(listener: (event: TelemetryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear all data.
   */
  clear(): void {
    this.metrics = [];
    this.spans = [];
  }

  private notify(event: TelemetryEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}
