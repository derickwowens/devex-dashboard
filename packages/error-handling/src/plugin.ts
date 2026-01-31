/**
 * Error Handling Plugin for the Federated SDK.
 */

import { ErrorFluent } from './fluent';
import { ErrorStore } from './store';
import { ErrorReport } from './types';

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

type ErrorHandler = (report: ErrorReport) => Promise<void>;

export interface ErrorHandlingConfig {
  /** Maximum errors to store in memory */
  maxStoreSize?: number;
  /** Environment name */
  environment?: string;
  /** Custom error handlers */
  handlers?: ErrorHandler[];
  /** Whether to log errors to console */
  logToConsole?: boolean;
}

export class ErrorHandlingPlugin implements Plugin<ErrorFluent> {
  readonly metadata: PluginMetadata = {
    name: 'error-handling',
    version: '1.0.0',
    description: 'Centralized error handling for the Federated DevEx Platform',
  };

  private store: ErrorStore;
  private handlers: ErrorHandler[] = [];
  private environment = 'development';
  private initialized = false;

  constructor() {
    this.store = new ErrorStore();
  }

  async initialize(config?: ErrorHandlingConfig): Promise<void> {
    if (this.initialized) return;

    if (config?.maxStoreSize) {
      this.store = new ErrorStore(config.maxStoreSize);
    }

    if (config?.environment) {
      this.environment = config.environment;
    }

    if (config?.handlers) {
      this.handlers.push(...config.handlers);
    }

    if (config?.logToConsole !== false) {
      this.handlers.push(this.consoleHandler);
    }

    this.initialized = true;
  }

  fluent(): ErrorFluent {
    return new ErrorFluent(this.store, this.handlers, this.environment);
  }

  /**
   * Get the error store for direct access (e.g., from dashboard).
   */
  getStore(): ErrorStore {
    return this.store;
  }

  /**
   * Add a custom error handler.
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  async destroy(): Promise<void> {
    this.store.clear();
    this.handlers = [];
    this.initialized = false;
  }

  private consoleHandler: ErrorHandler = async (report) => {
    const prefix = `[${report.severity.toUpperCase()}]`;
    const context = report.context.component 
      ? `[${report.context.component}]` 
      : '';
    
    console.error(
      `${prefix}${context} ${report.message}`,
      report.context
    );
  };
}
