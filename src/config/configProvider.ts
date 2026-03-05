import { env } from 'bun';
import { envSchema, type ENV } from './env';

class ConfigProvider {
  private readonly config: ENV;
  private static instance: ConfigProvider;

  private constructor(environment: Record<string, string | undefined> = env) {
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

  public static getInstance(
    environment?: Record<string, string | undefined>,
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
