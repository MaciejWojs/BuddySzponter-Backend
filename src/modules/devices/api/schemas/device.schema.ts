import { z } from 'zod';
export const createDeviceSchema = z.object({
  userId: z.number().optional().openapi({
    description: 'User ID',
    example: 123,
  }),
  fingerprint: z.string().openapi({
    description: 'Device fingerprint',
    example: 'unique-device-fingerprint',
  }),
  os: z.string().optional().openapi({
    description: 'Operating system of the device',
    example: 'Linux Mint 22.3',
  }),
  name: z.string().default('Unknown Device').openapi({
    description: 'Name of the device',
    example: "John's Laptop",
  }),
});
