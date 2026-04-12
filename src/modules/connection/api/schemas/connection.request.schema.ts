import { z } from 'zod';

import { createDeviceSchema } from '@/modules/devices/api/schemas/device.schema';

export const createConnectionSchema = z.object({
  password: z.string().min(8).max(64).openapi({
    description: 'Connection password, must be between 8 and 64 characters',
    example: 'SecureConnectionPassword123#'
  }),
  ...createDeviceSchema.shape
  // HostIp comes from request headers, so it's not required in the body
});

export const joinConnectionSchema = z.object({
  connectionCode: z.string().length(8).openapi({
    description: '8-character connection code',
    example: 'ABCD1234'
  }),
  password: z.string().min(8).max(64).openapi({
    description: 'Connection password, must be between 8 and 64 characters',
    example: 'SecureConnectionPassword123#'
  }),
  ...createDeviceSchema.shape
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type JoinConnectionInput = z.infer<typeof joinConnectionSchema>;
