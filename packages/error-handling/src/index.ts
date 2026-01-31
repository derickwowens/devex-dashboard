/**
 * @federated/error-handling
 * 
 * Centralized error handling for the Federated DevEx Platform.
 * Provides normalized error capture, context enrichment, and reporting.
 */

export { ErrorHandlingPlugin } from './plugin';
export { ErrorFluent } from './fluent';
export { 
  FederatedError, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorReport,
  ErrorOwnership,
  formatErrorString,
  formatErrorWithStack
} from './types';
export { ErrorStore } from './store';
