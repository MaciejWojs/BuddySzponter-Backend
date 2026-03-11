import { z } from 'zod';

const payloadSecretSchema = z
  .hex()
  .length(64, 'PAYLOAD_SECRET must be a 32-byte hex string')
  .transform((value) => Buffer.from(value, 'hex'));

export const envSchema = z
  .object({
    DEVELOPMENT: z
      .enum(['true', 'false', '1', '0'])
      .transform((val) => val === 'true' || val === '1'),

    PEPPER: z.string().min(8).max(64),
    SALT: z.string().min(8).max(64),

    DATABASE_URL: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(16).max(256),
    JWT_REFRESH_SECRET: z.string().min(16).max(256),
    PAYLOAD_SECRET: payloadSecretSchema.optional(),
    PAYLOAD_ENCRYPTED: z
      .enum(['true', 'false', '1', '0'])
      .transform((val) => val === 'true' || val === '1'),
  })
  .superRefine(({ PAYLOAD_ENCRYPTED, PAYLOAD_SECRET }, ctx) => {
    if (PAYLOAD_ENCRYPTED && !PAYLOAD_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['PAYLOAD_SECRET'],
        message: 'PAYLOAD_SECRET is required when PAYLOAD_ENCRYPTED is true',
      });
    }
  });

export type ENV = z.infer<typeof envSchema>;
