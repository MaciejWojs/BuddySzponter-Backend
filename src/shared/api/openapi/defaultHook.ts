import { Hook } from '@hono/zod-openapi';
import { Env } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

export const defaultHook: Hook<unknown, Env, string, unknown> = (
  result,
  _c,
) => {
  if (!result.success) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: result.error.issues.map((issue) => ({
        field: `${issue.path.join('.')}`,
        error: `${issue.message}`,
      })),
    });
  }
};
