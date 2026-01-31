/**
 * Fluent API for error handling.
 * Provides a chainable interface for capturing and reporting errors.
 */

import { ErrorContext, ErrorReport, ErrorSeverity, FederatedError } from './types';
import { ErrorStore } from './store';

type ErrorHandler = (report: ErrorReport) => Promise<void>;

export class ErrorFluent {
  private error: Error | null = null;
  private context: ErrorContext = {};
  private severity: ErrorSeverity = 'error';
  private handled = false;
  private store: ErrorStore;
  private handlers: ErrorHandler[];
  private environment: string;

  constructor(
    store: ErrorStore, 
    handlers: ErrorHandler[] = [],
    environment: string = 'development'
  ) {
    this.store = store;
    this.handlers = handlers;
    this.environment = environment;
  }

  /**
   * Capture an error to be processed.
   * @example
   * errors().capture(err).withContext({ userId: '123' }).send();
   */
  capture(error: unknown): this {
    if (error instanceof Error) {
      this.error = error;
    } else {
      this.error = new Error(String(error));
    }
    return this;
  }

  /**
   * Add context to the error.
   * @example
   * errors().capture(err).withContext({ operation: 'createUser' }).send();
   */
  withContext(context: ErrorContext): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Set the user ID in context.
   */
  forUser(userId: string): this {
    this.context.userId = userId;
    return this;
  }

  /**
   * Set the component/service name.
   */
  inComponent(component: string): this {
    this.context.component = component;
    return this;
  }

  /**
   * Set the operation being performed.
   */
  duringOperation(operation: string): this {
    this.context.operation = operation;
    return this;
  }

  /**
   * Add a request ID for tracing.
   */
  withRequestId(requestId: string): this {
    this.context.requestId = requestId;
    return this;
  }

  /**
   * Add tags for categorization.
   */
  withTags(...tags: string[]): this {
    this.context.tags = [...(this.context.tags ?? []), ...tags];
    return this;
  }

  /**
   * Add arbitrary metadata.
   */
  withMetadata(metadata: Record<string, unknown>): this {
    this.context.metadata = { ...this.context.metadata, ...metadata };
    return this;
  }

  /**
   * Set the error severity.
   * @example
   * errors().capture(err).withSeverity('critical').send();
   */
  withSeverity(severity: ErrorSeverity): this {
    this.severity = severity;
    return this;
  }

  /**
   * Mark the error as handled (won't propagate).
   */
  markHandled(): this {
    this.handled = true;
    return this;
  }

  /**
   * Build the error report without sending.
   */
  build(): ErrorReport {
    if (!this.error) {
      throw new Error('No error captured. Call capture() first.');
    }

    const fedError = FederatedError.from(this.error, this.context);
    
    return {
      id: this.generateId(),
      timestamp: new Date(),
      message: fedError.message,
      name: fedError.name,
      stack: fedError.stack,
      severity: this.severity,
      context: this.context,
      handled: this.handled,
      source: '@federated/error-handling',
      environment: this.environment,
    };
  }

  /**
   * Send the error report to all handlers.
   */
  async send(): Promise<ErrorReport> {
    const report = this.build();
    
    // Store the error
    this.store.add(report);
    
    // Run all handlers
    await Promise.all(
      this.handlers.map(handler => 
        handler(report).catch(err => {
          console.error('[ErrorFluent] Handler failed:', err);
        })
      )
    );
    
    // Reset for reuse
    this.reset();
    
    return report;
  }

  /**
   * Convenience method to capture and send in one call.
   */
  async report(error: unknown, context?: ErrorContext): Promise<ErrorReport> {
    this.capture(error);
    if (context) {
      this.withContext(context);
    }
    return this.send();
  }

  /**
   * Create a new fluent instance (for chaining from a fresh state).
   */
  fresh(): ErrorFluent {
    return new ErrorFluent(this.store, this.handlers, this.environment);
  }

  private reset(): void {
    this.error = null;
    this.context = {};
    this.severity = 'error';
    this.handled = false;
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
