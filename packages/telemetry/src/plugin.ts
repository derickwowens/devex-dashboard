/**
 * Telemetry Plugin for the Federated SDK.
 */

import { TelemetryFluent } from './fluent';
import { MetricsStore } from './store';
import { TelemetryExporter } from './types';

interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}

interface Plugin<TFluent = unknown> {
  readonly metadata: PluginMetadata;
  initialize(config?: Record<string, unknown>): Promise<void>;
  fluent(): TFluent;
  destroy(): Promise<void>;
}

export interface TelemetryPluginConfig {
  /** Maximum events to store in memory */
  maxStoreSize?: number;
  /** Sample rate (0-1) */
  sampleRate?: number;
  /** Custom exporters */
  exporters?: TelemetryExporter[];
  /** Flush interval in milliseconds */
  flushIntervalMs?: number;
}

export class TelemetryPlugin implements Plugin<TelemetryFluent> {
  readonly metadata: PluginMetadata = {
    name: 'telemetry',
    version: '1.0.0',
    description: 'Centralized telemetry for the Federated DevEx Platform',
  };

  private store: MetricsStore;
  private exporters: TelemetryExporter[] = [];
  private sampleRate = 1.0;
  private initialized = false;

  constructor() {
    this.store = new MetricsStore();
  }

  async initialize(config?: TelemetryPluginConfig): Promise<void> {
    if (this.initialized) return;

    if (config?.maxStoreSize) {
      this.store = new MetricsStore(config.maxStoreSize);
    }

    if (config?.sampleRate !== undefined) {
      this.sampleRate = config.sampleRate;
    }

    if (config?.exporters) {
      this.exporters.push(...config.exporters);
    }

    this.initialized = true;
  }

  fluent(): TelemetryFluent {
    return new TelemetryFluent(this.store);
  }

  /**
   * Get the metrics store for direct access.
   */
  getStore(): MetricsStore {
    return this.store;
  }

  /**
   * Add a custom exporter.
   */
  addExporter(exporter: TelemetryExporter): void {
    this.exporters.push(exporter);
  }

  async destroy(): Promise<void> {
    this.store.clear();
    this.exporters = [];
    this.initialized = false;
  }
}
