import { env } from 'bun';
import { envSchema, type ENV } from './env';

class ConfigProvider {
  private readonly config: ENV;

  constructor(environment: Record<string, string | undefined> = env) {
    try {
      this.config = envSchema.parse(environment);
    } catch (error) {
      console.error('Environment variables validation failed:', error);
      throw new Error(
        'Invalid environment variables. Please check your .env file and refer to the ZOD schema.',
        { cause: error },
      );
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
