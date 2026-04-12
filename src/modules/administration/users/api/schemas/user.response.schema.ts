import { z } from 'zod';

export const getUserResponseSchema = z.object({
  id: z.number().positive().min(1).openapi({
    description: 'Unique identifier for the user',
    example: 123,
  }),
  roleId: z.number().positive().min(1).openapi({
    description: 'Role identifier for the user',
    example: 1,
  }),
  email: z.email().openapi({
    description: 'Email address for the user',
    example: 'user@example.com',
  }),
  nickname: z.string().max(100).openapi({
    description: 'Nickname for the user',
    example: 'john_doe',
  }),
  avatar: z.string().nullable().openapi({
    description: 'Random generated avatar identifier for avatar',
    example: 'a1b2c3d4e5f6g7h8i9j0',
  }),
  isBanned: z.boolean().openapi({
    description: 'Indicates if the user is banned',
    example: false,
  }),
  isDeleted: z.boolean().openapi({
    description: 'Indicates if the user is deleted',
    example: false,
  }),
  createdAt: z.date().openapi({
    description: 'Timestamp when the user was created',
    example: '2023-01-01T00:00:00Z',
  }),
  updatedAt: z.date().openapi({
    description: 'Timestamp when the user was last updated',
    example: '2023-01-01T00:00:00Z',
  }),
});

export const getUsersResponseSchema = z.array(getUserResponseSchema);

export const getUserDeviceResponseSchema = z.object({
  id: z.uuid().openapi({
    description: 'Unique identifier for the device',
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82',
  }),
  userId: z.number().positive().openapi({
    description: 'User identifier owning the device',
    example: 123,
  }),
  fingerprint: z.string().openapi({
    description: 'Device fingerprint provided by client',
    example: '6f4f2c9c-6a7f-4b37-9324-0fc8a5f5f951',
  }),
  name: z.string().openapi({
    description: 'Device name',
    example: "John's Laptop",
  }),
  os: z.string().openapi({
    description: 'Operating system name',
    example: 'Windows 10',
  }),
  createdAt: z.date().openapi({
    description: 'Timestamp when the device record was created',
    example: '2026-03-29T15:55:00.386Z',
  }),
});

export const getUserDevicesResponseSchema = z.array(
  getUserDeviceResponseSchema,
);

export const getUserSessionResponseSchema = z.object({
  id: z.uuid().openapi({
    description: 'Unique identifier for the auth session',
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82',
  }),
  userId: z.number().positive().openapi({
    description: 'User identifier owning the session',
    example: 123,
  }),
  deviceId: z.uuid().openapi({
    description: 'Device identifier associated with the session',
    example: '6f4f2c9c-6a7f-4b37-9324-0fc8a5f5f951',
  }),
  ipAddress: z.string().openapi({
    description: 'IP address used in the session',
    example: '192.168.0.10',
  }),
  userAgent: z.string().openapi({
    description: 'User-Agent string captured for the session',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  }),
  revoked: z.boolean().openapi({
    description: 'Whether the session has been revoked',
    example: false,
  }),
  createdAt: z.date().openapi({
    description: 'Timestamp when the session was created',
    example: '2026-03-29T15:55:00.386Z',
  }),
  expiresAt: z.date().openapi({
    description: 'Timestamp when the session expires',
    example: '2026-04-05T15:55:00.386Z',
  }),
});

export const getUserSessionsResponseSchema = z.array(
  getUserSessionResponseSchema,
);

export const patchUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export const deleteUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export const postUserAvatarResponseSchema = z.object({
  message: z.string().min(2).max(255),
  avatar: z.string().length(32),
});

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;
export type GetUserDeviceResponse = z.infer<typeof getUserDeviceResponseSchema>;
export type GetUserSessionResponse = z.infer<
  typeof getUserSessionResponseSchema
>;
