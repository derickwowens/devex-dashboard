/**
 * @federated/telemetry
 * 
 * Centralized telemetry for the Federated DevEx Platform.
 * Provides metrics, tracing, and observability capabilities.
 */

export { TelemetryPlugin } from './plugin';
export { TelemetryFluent } from './fluent';
export { Metric, Span, TelemetryEvent } from './types';
export { MetricsStore } from './store';
