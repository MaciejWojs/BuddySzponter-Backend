import { z } from '@hono/zod-openapi';

export const healthPayloadResponseSchema = z.object({
  service: z.string().min(5).max(100),
  version: z.string().min(5).max(20),
  timestamp: z.iso.datetime(),
});

export const deepHealthResponseSchema = z.object({
  ...healthPayloadResponseSchema.shape,
  database: z.object({
    status: z.enum(['OK', 'ERROR']),
    responseTimeMs: z.number().positive(),
  }),
  cache: z.object({
    status: z.enum(['OK', 'ERROR']),
    responseTimeMs: z.number().positive(),
  }),
  minio: z.object({
    status: z.enum(['OK', 'ERROR']),
    responseTimeMs: z.number().positive(),
  }),
});
