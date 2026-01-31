/**
 * Fluent API for telemetry.
 * Provides a chainable interface for metrics and tracing.
 */

import { Metric, MetricType, MetricUnit, Span } from './types';
import { MetricsStore } from './store';

export class TelemetryFluent {
  private store: MetricsStore;
  private currentMetricName: string | null = null;
  private currentMetricType: MetricType = 'counter';
  private currentValue: number = 0;
  private currentUnit: MetricUnit = 'count';
  private currentTags: Record<string, string> = {};
  private currentComponent: string | undefined;

  private activeSpans: Map<string, Span> = new Map();

  constructor(store: MetricsStore) {
    this.store = store;
  }

  /**
   * Start building a metric.
   * @example
   * telemetry().metric('api.latency').value(150).unit('ms').send();
   */
  metric(name: string): this {
    this.currentMetricName = name;
    return this;
  }

  /**
   * Set the metric type.
   */
  type(type: MetricType): this {
    this.currentMetricType = type;
    return this;
  }

  /**
   * Set the metric value.
   */
  value(value: number): this {
    this.currentValue = value;
    return this;
  }

  /**
   * Set the metric unit.
   */
  unit(unit: MetricUnit): this {
    this.currentUnit = unit;
    return this;
  }

  /**
   * Add a tag to the metric.
   */
  tag(key: string, value: string): this {
    this.currentTags[key] = value;
    return this;
  }

  /**
   * Add multiple tags.
   */
  tags(tags: Record<string, string>): this {
    this.currentTags = { ...this.currentTags, ...tags };
    return this;
  }

  /**
   * Set the component name.
   */
  component(name: string): this {
    this.currentComponent = name;
    return this;
  }

  /**
   * Send the metric.
   */
  send(): Metric {
    if (!this.currentMetricName) {
      throw new Error('No metric name set. Call metric() first.');
    }

    const metric: Metric = {
      name: this.currentMetricName,
      type: this.currentMetricType,
      value: this.currentValue,
      unit: this.currentUnit,
      timestamp: new Date(),
      tags: { ...this.currentTags },
      component: this.currentComponent,
    };

    this.store.addMetric(metric);
    this.resetMetric();

    return metric;
  }

  /**
   * Increment a counter metric.
   */
  increment(name: string, amount: number = 1): Metric {
    return this.metric(name).type('counter').value(amount).send();
  }

  /**
   * Record a gauge metric.
   */
  gauge(name: string, value: number): Metric {
    return this.metric(name).type('gauge').value(value).send();
  }

  /**
   * Record a timing metric.
   */
  timing(name: string, durationMs: number): Metric {
    return this.metric(name).type('timer').value(durationMs).unit('ms').send();
  }

  /**
   * Start a new span for tracing.
   */
  startSpan(name: string, traceId?: string, parentId?: string): Span {
    const span: Span = {
      id: this.generateId(),
      traceId: traceId ?? this.generateId(),
      parentId,
      name,
      startTime: new Date(),
      status: 'unset',
      attributes: {},
      events: [],
    };

    this.activeSpans.set(span.id, span);
    return span;
  }

  /**
   * End a span.
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok'): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;

    this.activeSpans.delete(spanId);
    this.store.addSpan(span);

    return span;
  }

  /**
   * Add an event to an active span.
   */
  addSpanEvent(
    spanId: string,
    eventName: string,
    attributes?: Record<string, unknown>
  ): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.events.push({
      name: eventName,
      timestamp: new Date(),
      attributes: attributes ?? {},
    });
  }

  /**
   * Set attributes on an active span.
   */
  setSpanAttributes(spanId: string, attributes: Record<string, unknown>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.attributes = { ...span.attributes, ...attributes };
  }

  /**
   * Time an async operation.
   */
  async time<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      this.timing(name, Date.now() - start);
      return result;
    } catch (error) {
      this.timing(`${name}.error`, Date.now() - start);
      throw error;
    }
  }

  /**
   * Create a fresh fluent instance.
   */
  fresh(): TelemetryFluent {
    return new TelemetryFluent(this.store);
  }

  private resetMetric(): void {
    this.currentMetricName = null;
    this.currentMetricType = 'counter';
    this.currentValue = 0;
    this.currentUnit = 'count';
    this.currentTags = {};
    this.currentComponent = undefined;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
