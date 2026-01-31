/**
 * SDK Configuration types and defaults.
 */

export interface SDKConfig {
  /** Environment: development, staging, production */
  environment: 'development' | 'staging' | 'production';
  
  /** Base URL for API endpoints */
  apiBaseUrl: string;
  
  /** Enable debug logging */
  debug: boolean;
  
  /** Request timeout in milliseconds */
  timeoutMs: number;
  
  /** Retry configuration */
  retry: {
    maxAttempts: number;
    backoffMs: number;
    maxBackoffMs: number;
  };
  
  /** Telemetry configuration */
  telemetry: {
    enabled: boolean;
    sampleRate: number;
    endpoint?: string;
  };
  
  /** Plugin-specific configurations */
  plugins: Record<string, Record<string, unknown>>;
}

/**
 * Create a default SDK configuration.
 */
export function createDefaultConfig(
  overrides?: Partial<SDKConfig>
): SDKConfig {
  const defaults: SDKConfig = {
    environment: 'development',
    apiBaseUrl: 'http://localhost:3000',
    debug: true,
    timeoutMs: 30000,
    retry: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 10000,
    },
    telemetry: {
      enabled: true,
      sampleRate: 1.0,
    },
    plugins: {},
  };
  
  return {
    ...defaults,
    ...overrides,
    retry: {
      ...defaults.retry,
      ...overrides?.retry,
    },
    telemetry: {
      ...defaults.telemetry,
      ...overrides?.telemetry,
    },
    plugins: {
      ...defaults.plugins,
      ...overrides?.plugins,
    },
  };
}
