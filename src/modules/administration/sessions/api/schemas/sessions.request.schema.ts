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

export const getSessionsQuerySchema = z.object({
  activeOnly: queryBooleanSchema.optional().openapi({
    description: 'Return only active sessions (not revoked and not expired)',
    example: true
  })
});

export const sessionIdParamSchema = z.object({
  id: z.uuid().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 'd2faf722-af7c-4925-aa67-1cc1ef579d82'
  })
});

export type GetSessionsQuery = z.infer<typeof getSessionsQuerySchema>;
