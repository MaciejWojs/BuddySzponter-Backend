import { z } from 'zod';

const queryBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'on') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'off') {
      return false;
    }
  }
  return value;
}, z.boolean());

export const userIdParamSchema = z.object({
  // TODO HONO AND ZOD-OPENAPI causing issues with number params, needs to be string for now
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    type: 'integer',
    example: '123',
  }),
});

export const userIdDeviceIdParamSchema = z.object({
  id: z.string().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    type: 'integer',
    example: '123',
  }),
  deviceId: z.uuid().openapi({
    param: {
      name: 'deviceId',
      in: 'path',
    },
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82',
  }),
});

export const getUsersTotalQuerySchema = z.object({
  nickname: z.string().trim().min(1).max(100).optional().openapi({
    example: 'john',
    description: 'Filter by nickname',
  }),
  email: z.email().optional().openapi({
    example: 'john@example.com',
    description: 'Filter by email',
  }),
  role: z.string().trim().min(1).max(100).optional().openapi({
    example: 'ADMIN',
    description: 'Filter by role name',
  }),
  isBanned: queryBooleanSchema.optional().openapi({
    example: false,
    description: 'Filter by banned flag',
  }),
  isDeleted: queryBooleanSchema.optional().openapi({
    example: false,
    description: 'Filter by deleted flag',
  }),
});

export const getUsersQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0).openapi({
    example: 0,
    description: 'Pagination offset',
  }),
  limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
    example: 10,
    description: 'Pagination limit',
  }),
  nickname: z.string().trim().min(1).max(100).optional().openapi({
    example: 'john',
    description: 'Filter by nickname',
  }),
  email: z.email().optional().openapi({
    example: 'john@example.com',
    description: 'Filter by email',
  }),
  role: z.string().trim().min(1).max(100).optional().openapi({
    example: 'ADMIN',
    description: 'Filter by role name',
  }),
  isBanned: queryBooleanSchema.optional().openapi({
    example: false,
    description: 'Filter by banned flag',
  }),
  isDeleted: queryBooleanSchema.optional().openapi({
    example: false,
    description: 'Filter by deleted flag',
  }),
});

export const patchAdminUserSchema = z
  .object({
    nickname: z.string().min(3).max(100).optional().openapi({
      description: 'User nickname, must be between 3 and 100 characters',
      example: 'john_doe_new',
    }),
    email: z.email().optional().openapi({
      description: 'User email address, must be a valid email format',
      example: 'john.doe.new@example.com',
    }),
    password: z.string().min(8).optional().openapi({
      description: 'User password, must be at least 8 characters',
      example: 'SecurePassword123#',
    }),
    isBanned: queryBooleanSchema.optional().openapi({
      description: 'Indicates if the user is banned',
      example: false,
    }),
    isDeleted: queryBooleanSchema.optional().openapi({
      description: 'Indicates if the user is deleted',
      example: false,
    }),
    roleId: z.coerce.number().int().positive().optional().openapi({
      description: 'Role identifier assigned to the user',
      example: 2,
    }),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided',
  });

export const postUserAvatarRequestSchema = z.object({
  avatar: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (png, jpg/jpeg, webp, max 10MB)',
  }),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type PatchAdminUserInput = z.infer<typeof patchAdminUserSchema>;
