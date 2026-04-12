import { Hook } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { ENV } from '@/shared/types/honoENV';

export const defaultHook: Hook<unknown, ENV, string, unknown> = (
  result,
  _c
) => {
  if (!result.success) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: result.error.issues.map((issue) => ({
        field: `${issue.path.join('.')}`,
        error: `${issue.message}`
      }))
    });
  }
};
