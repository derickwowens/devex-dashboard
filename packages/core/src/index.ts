/**
 * @federated/core
 * 
 * Core SDK for the Federated DevEx Platform.
 * Orchestrates all child SDKs and provides plugin registration.
 */

export { FederatedSDK } from './sdk';
export { Plugin, PluginMetadata } from './plugin';
export { VersionManager, SemanticVersion } from './version-manager';
export { SDKConfig, createDefaultConfig } from './config';
