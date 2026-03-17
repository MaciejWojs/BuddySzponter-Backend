import { z } from 'zod';

import { createDeviceSchema } from '@/modules/devices/api/schemas/device.schema';

export const createConnectionSchema = z.object({
  password: z.string().min(8).max(64),
  ...createDeviceSchema.shape,
  // HostIp comes from request headers, so it's not required in the body
});

export const joinConnectionSchema = z.object({
  connectionCode: z.string().length(8),
  password: z.string().min(8).max(64),
  ...createDeviceSchema.shape,
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type JoinConnectionInput = z.infer<typeof joinConnectionSchema>;
