/**
 * @federated/facade
 * 
 * The Fluent Facade - a thin orchestration layer for the Federated DevEx Platform.
 * This is the primary entry point for consumers of the ecosystem.
 * 
 * @example
 * import { sdk, createSDK } from '@federated/facade';
 * 
 * // Use the default singleton
 * sdk.errors().capture(err).send();
 * sdk.ui().button('primary').getConfig();
 * sdk.telemetry().timing('api.latency', 150);
 * 
 * // Or create a custom instance
 * const customSdk = createSDK({ environment: 'production' });
 */

export { FederatedFacade, createSDK, sdk } from './facade';
export { PipelinesFluent, Pipeline, PipelineStatus } from './pipelines';
export { ContactsFluent, Contact, ContactType } from './contacts';
export { 
  DocumentationFluent, 
  DocumentationStore,
  Document, 
  DocumentType, 
  DocumentLink, 
  DocumentBuild 
} from './documentation';

export type { FacadeConfig } from './facade';
