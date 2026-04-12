import { z } from 'zod';

export const patchSelfUserSchema = z
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
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided',
  });

export const postUserAvatarRequestSchema = z.object({
  // TODO: waiting for zod-openapi to support file validation
  //   avatar: z
  //     .file()
  //     .min(1, 'Avatar cannot be empty')
  //     .max(10 * 1024 * 1024, 'Avatar max size is 10MB')
  //     .mime(
  //       ['image/png', 'image/jpeg', 'image/webp'],
  //       'Avatar must be PNG, JPEG, or WEBP',
  //     ),
  avatar: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (png, jpg/jpeg, webp, max 10MB)',
  }),
  // avatar: z.string().min(1, 'Avatar cannot be empty'),
});

export type PatchUserInput = z.infer<typeof patchSelfUserSchema> & {
  isBanned?: boolean;
  isDeleted?: boolean;
  roleId?: number;
};

export type PatchSelfUserInput = z.infer<typeof patchSelfUserSchema>;
export type PostUserAvatarInput = z.infer<typeof postUserAvatarRequestSchema>;
