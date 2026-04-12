import { z } from 'zod';

export const deviceIdParamSchema = z.object({
  deviceID: z.uuid().openapi({
    param: {
      name: 'deviceID',
      in: 'path'
    },
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82'
  })
});

export const getDevicesQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0).openapi({
    description: 'Pagination offset',
    example: 0
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    description: 'Pagination limit',
    example: 10
  })
});

export const patchDeviceRequestSchema = z
  .object({
    userId: z.number().int().positive().nullable().optional().openapi({
      description: 'Assigned user ID (null to unassign)',
      example: 123
    }),
    name: z.string().trim().min(1).max(255).optional().openapi({
      description: 'Device display name',
      example: "John's Laptop"
    }),
    os: z.string().trim().min(1).max(100).optional().openapi({
      description: 'Device operating system',
      example: 'Windows 10'
    })
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided'
  });

export type PatchDeviceInput = z.infer<typeof patchDeviceRequestSchema>;
export type GetDevicesQuery = z.infer<typeof getDevicesQuerySchema>;
