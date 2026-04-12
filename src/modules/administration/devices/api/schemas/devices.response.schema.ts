import { z } from 'zod';

export const deviceResponseSchema = z.object({
  id: z.uuid().openapi({
    description: 'Device UUID',
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82'
  }),
  userId: z.number().int().positive().nullable().openapi({
    description: 'Assigned user ID',
    example: 1
  }),
  fingerprint: z.string().openapi({
    description: 'Device fingerprint',
    example: 'abc123-fingerprint'
  }),
  name: z.string().openapi({
    description: 'Device display name',
    example: "John's Laptop"
  }),
  os: z.string().openapi({
    description: 'Device operating system',
    example: 'Windows 10'
  }),
  createdAt: z.date().openapi({
    description: 'Device creation timestamp',
    example: '2026-03-26T13:39:58.335Z'
  })
});

export const devicesResponseSchema = z.array(deviceResponseSchema);

export const deviceMutationResponseSchema = z.object({
  message: z.string().min(2).max(255)
});

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;
