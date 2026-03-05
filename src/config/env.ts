import { z } from 'zod';

export const envSchema = z.object({
  PEPPER: z.string().min(8).max(64),
  SALT: z.string().min(8).max(64),
  DEVELOPMENT: z.string().transform((val) => val === 'true' || val === '1'),
  DATABASE_URL: z.string(),

  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1).max(64),
  POSTGRES_DB: z.string().min(1),

  VALKEY_PASSWORD: z.string().min(8).max(64),
  VALKEY_USER: z.string().min(1),

  MINIO_ROOT_USER: z.string().min(1),
  MINIO_ROOT_PASSWORD: z.string().min(1).max(64),

  PHOTO_QUEUE_NAME: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16).max(256),
  JWT_REFRESH_SECRET: z.string().min(16).max(256),
});

export type ENV = z.infer<typeof envSchema>;
