import { env } from 'bun';
import { envSchema, type ENV } from './env';

class ConfigProvider {
  private config: ENV;

  constructor(environment: Record<string, string | undefined> = env) {
    try {
      this.config = envSchema.parse(environment);
    } catch (error) {
      console.error('Environment variables validation failed:', error);
      process.exit(1);
    }
  }

  get<K extends keyof ENV>(key: K): ENV[K] {
    return this.config[key];
  }

  getConfig(): ENV {
    return this.config;
  }
}

export const configProvider = new ConfigProvider();
