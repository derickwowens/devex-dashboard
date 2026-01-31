/**
 * @federated/ui-config
 * 
 * Centralized UI component configuration for the Federated DevEx Platform.
 * Provides a registry of component configurations for consistent design.
 */

export { UIConfigPlugin } from './plugin';
export { UIFluent } from './fluent';
export { 
  ComponentConfig, 
  ComponentVariant, 
  ComponentSize,
  ThemeConfig,
  ColorPalette 
} from './types';
export { ComponentRegistry } from './registry';
