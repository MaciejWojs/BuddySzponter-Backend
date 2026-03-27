import { z } from 'zod';

export const getUsersTotalResponseSchema = z.object({
  total: z.number().int().min(0).openapi({
    example: 125,
    description: 'Total number of users for given filters',
  }),
});

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

export const patchUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});
export const deleteUserResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export const postUserAvatarResponseSchema = z.object({
  message: z.string().min(2).max(255),
});

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;
