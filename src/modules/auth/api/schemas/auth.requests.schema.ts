import { z } from 'zod';

export const registerBodySchema = z
  .object({
    nickname: z.string().min(3).max(20).openapi({
      description: 'Nickname of the user, must be between 3 and 20 characters',
      example: 'john_doe'
    }),
    email: z.email().openapi({
      description: 'Email address of the user',
      example: 'john.doe@example.com'
    }),
    password: z.string().min(8).openapi({
      description: 'Password of the user, must be at least 8 characters',
      example: 'SecurePassword123#'
    }),
    passwordConfirm: z.string().min(8).openapi({
      description: 'Confirmation of the user password',
      example: 'SecurePassword123#'
    }),
    deviceId: z.uuid().optional().openapi({
      description: 'Optional device UUID from cookie/client',
      example: '3d1dbf9f-6f23-4fdf-8a8f-746ac7a80b7d'
    }),
    fingerprint: z.string().min(1).openapi({
      description: 'Fingerprint of the user device',
      example: 'unique-device-fingerprint'
    }),
    os: z.string().openapi({
      description: 'Operating system of the user device',
      example: 'Windows 11'
    }),
    name: z.string().openapi({
      description: 'Name of the user device',
      example: "John's Laptop"
    })
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['passwordConfirm']
      });
    }
  });

export const loginBodySchema = z.object({
  email: z.email().openapi({
    description: 'Email address of the user',
    example: 'john.doe@example.com'
  }),
  password: z.string().min(8).openapi({
    description: 'Password of the user, must be at least 8 characters',
    example: 'SecurePassword123#'
  }),
  deviceId: z.uuid().optional().openapi({
    description: 'Optional device UUID from cookie/client',
    example: '3d1dbf9f-6f23-4fdf-8a8f-746ac7a80b7d'
  }),
  fingerprint: z.string().min(1).openapi({
    description: 'Device fingerprint',
    example: 'unique-device-fingerprint'
  }),
  os: z.string().optional().openapi({
    description: 'Operating system of the user',
    example: 'Windows 10'
  }),
  name: z.string().optional().openapi({
    description: 'Name of the user',
    example: "John's Laptop"
  })
});

export const refreshTokenCookieSchema = z.object({
  refreshToken: z.jwt().openapi({
    description: 'Refresh token for the user'
  })
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshInput = z.infer<typeof refreshTokenCookieSchema>;
