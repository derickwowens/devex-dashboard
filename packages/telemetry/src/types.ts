/**
 * Telemetry types for metrics and tracing.
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';
export type MetricUnit = 'ms' | 's' | 'bytes' | 'count' | 'percent' | 'custom';

export interface Metric {
  /** Metric name */
  name: string;
  /** Metric type */
  type: MetricType;
  /** Metric value */
  value: number;
  /** Unit of measurement */
  unit: MetricUnit;
  /** Timestamp */
  timestamp: Date;
  /** Tags for filtering */
  tags: Record<string, string>;
  /** Component that emitted the metric */
  component?: string;
}

export interface Span {
  /** Unique span ID */
  id: string;
  /** Trace ID (groups related spans) */
  traceId: string;
  /** Parent span ID */
  parentId?: string;
  /** Operation name */
  name: string;
  /** Start time */
  startTime: Date;
  /** End time */
  endTime?: Date;
  /** Duration in milliseconds */
  duration?: number;
  /** Span status */
  status: 'ok' | 'error' | 'unset';
  /** Span attributes */
  attributes: Record<string, unknown>;
  /** Events within the span */
  events: SpanEvent[];
}

export interface SpanEvent {
  /** Event name */
  name: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event attributes */
  attributes: Record<string, unknown>;
}

export interface TelemetryEvent {
  /** Event type */
  type: 'metric' | 'span' | 'log';
  /** Event data */
  data: Metric | Span;
  /** Timestamp */
  timestamp: Date;
}

export interface TelemetryExporter {
  /** Export telemetry data */
  export(events: TelemetryEvent[]): Promise<void>;
}
