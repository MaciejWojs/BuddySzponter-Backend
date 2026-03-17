import { z } from 'zod';
export const createDeviceSchema = z.object({
  userId: z.number().optional(),
  fingerprint: z.string(),
  os: z.string().optional(),
  name: z.string().default('Unknown Device'),
  type: z.enum(['mobile', 'desktop', 'tablet']),
  browser: z.string(),
});
