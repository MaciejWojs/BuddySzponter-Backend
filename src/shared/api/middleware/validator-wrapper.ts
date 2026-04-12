import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';
import * as zod from 'zod';

export const zValidator = <
  T extends zod.ZodType,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) =>
  // prettier-ignore
  zv(target, schema, (result, _c) => {  
    if (!result.success) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: result.error.issues.map((issue) => ({
          field: `${issue.path.join('.')}`,
          error: `${issue.message}`
        }))
      });
    }
  });
