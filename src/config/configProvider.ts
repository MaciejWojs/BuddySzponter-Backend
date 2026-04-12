import { env } from 'bun';

import { type ENV, envSchema } from './env';

class ConfigProvider {
  private static instance: ConfigProvider | undefined;

  private readonly config: ENV;

  private constructor(environment: Record<string, string | undefined> = env) {
    try {
      this.config = envSchema.parse(environment);
    } catch (error) {
      console.error('Environment variables validation failed:', error);
      process.exit(1);
    }
  }

  public static getInstance(
    environment?: Record<string, string | undefined>
  ): ConfigProvider {
    if (!ConfigProvider.instance) {
      ConfigProvider.instance = new ConfigProvider(environment ?? env);
    }
    return ConfigProvider.instance;
  }

  get<K extends keyof ENV>(key: K): ENV[K] {
    return this.config[key];
  }

  getConfig(): ENV {
    return { ...this.config };
  }
}

export const configProvider = ConfigProvider.getInstance();
