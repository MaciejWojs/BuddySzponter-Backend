import { z } from 'zod';
export const createDeviceSchema = z.object({
  userId: z.number().optional().openapi({
    description: 'User ID',
    example: 123
  }),
  deviceId: z.uuid().openapi({
    description: 'Unique device UUID generated on the client',
    example: '3d1dbf9f-6f23-4fdf-8a8f-746ac7a80b7d'
  }),
  fingerprint: z.string().optional().openapi({
    description: 'Device fingerprint',
    example: 'unique-device-fingerprint'
  }),
  os: z.string().optional().openapi({
    description: 'Operating system of the device',
    example: 'Linux Mint 22.3'
  }),
  name: z.string().default('Unknown Device').openapi({
    description: 'Name of the device',
    example: "John's Laptop"
  })
});
