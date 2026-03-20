import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.number().positive().min(1),
});
export const getUsersPaginatedQuerySchema = z.object({
  offset: z.number().min(0).default(0),
  limit: z.number().positive().default(10),
});

export const patchUserRequestSchema = z
  .object({
    nickname: z.string().min(3).max(100),
    email: z.email(),
    password: z.string().min(8),
    isBanned: z.boolean(),
    isDeleted: z.boolean(),
  })
  .partial();

export const postUserAvatarRequestSchema = z.object({
  //TODO Waiting for zod-openapi to support file validation
  //   avatar: z
  //     .file()
  //     .min(1, 'Avatar cannot be empty')
  //     .max(10 * 1024 * 1024, 'Avatar max size is 10MB')
  //     .mime(
  //       ['image/png', 'image/jpeg', 'image/webp'],
  //       'Avatar must be PNG, JPEG, or WEBP',
  //     ),
  avatar: z.string().min(1, 'Avatar cannot be empty'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type PatchUserInput = z.infer<typeof patchUserRequestSchema>;
export type PostUserAvatarInput = z.infer<typeof postUserAvatarRequestSchema>;
