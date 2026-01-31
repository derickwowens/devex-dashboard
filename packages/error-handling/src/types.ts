/**
 * Error handling types for the ecosystem.
 */

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface ErrorOwnership {
  /** Team responsible for this error/component */
  team: string;
  /** Contact email for the responsible team */
  email: string;
  /** Incident group to assign tickets to */
  incidentGroup: string;
}

export interface ErrorContext {
  /** User ID if available */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Operation being performed */
  operation?: string;
  /** Component or service name */
  component?: string;
  /** Request ID for tracing */
  requestId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Tags for categorization */
  tags?: string[];
}

export interface ErrorReport {
  /** Unique error ID (format: SDK-XXXXX) */
  errorId: string;
  /** Internal tracking ID */
  id: string;
  /** Timestamp of error occurrence */
  timestamp: Date;
  /** Error message */
  message: string;
  /** Error name/type */
  name: string;
  /** Stack trace if available */
  stack?: string;
  /** Error severity */
  severity: ErrorSeverity;
  /** Error context */
  context: ErrorContext;
  /** Whether the error was handled */
  handled: boolean;
  /** Source SDK/API that captured the error */
  sdkName: string;
  /** Environment where error occurred */
  environment: string;
  /** Ownership information for ticket routing */
  ownership: ErrorOwnership;
}

/**
 * Format an error report as a standardized error string.
 * Format: [ErrorCode]: [ErrorString]: [TeamName]: [TeamEmail]: [IncidentGroup]
 * 
 * @example
 * // Returns: "AUTH-00142: Token refresh failed: Platform Auth: auth-team@company.com: #auth-incidents"
 * formatErrorString(errorReport)
 */
export function formatErrorString(error: ErrorReport): string {
  return `${error.errorId}: ${error.message}: ${error.ownership.team}: ${error.ownership.email}: ${error.ownership.incidentGroup}`;
}

/**
 * Format an error report with its stack trace using the standardized format.
 * The error string appears as the first line, followed by the stack trace.
 */
export function formatErrorWithStack(error: ErrorReport): string {
  const errorString = formatErrorString(error);
  if (error.stack) {
    return `${errorString}\n${error.stack}`;
  }
  return errorString;
}

export interface ErrorHandler {
  /** Handle an error report */
  handle(report: ErrorReport): Promise<void>;
}

/**
 * Custom error class for the federated ecosystem.
 */
export class FederatedError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      severity?: ErrorSeverity;
      context?: ErrorContext;
      cause?: Error;
      isOperational?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'FederatedError';
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.severity = options.severity ?? 'error';
    this.context = options.context ?? {};
    this.timestamp = new Date();
    this.isOperational = options.isOperational ?? true;
    
    if (options.cause) {
      this.cause = options.cause;
    }
    
    Error.captureStackTrace(this, FederatedError);
  }

  /**
   * Create a FederatedError from any error.
   */
  static from(error: unknown, context?: ErrorContext): FederatedError {
    if (error instanceof FederatedError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new FederatedError(error.message, {
        cause: error,
        context,
      });
    }
    
    return new FederatedError(String(error), { context });
  }

  /**
   * Convert to a plain object for serialization.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      isOperational: this.isOperational,
    };
  }
}
