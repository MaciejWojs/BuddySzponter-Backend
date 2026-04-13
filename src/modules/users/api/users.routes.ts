import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { DeleteUser } from '@/modules/users/application/use-case/deleteUser';
import { PostUserAvatar } from '@/modules/users/application/use-case/postUserAvatar';
import { UpdateUser } from '@/modules/users/application/use-case/updateUser';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import {
  deleteSelfUserRoute,
  postSelfUserAvatarRequestRoute,
  updateSelfUserRoute
} from './users.openapi';

const usersRouter = new OpenAPIHono<ENV>({ defaultHook });

usersRouter.openapi(updateSelfUserRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }]
    });
  }

  const userId = jwtPayload.userId;
  const body = c.req.valid('json');

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new UpdateUser(repo);

  try {
    await useCase.execute(userId, userId, body);
    return c.json(
      { message: 'Current user updated successfully' },
      StatusCodes.OK
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'user', error: err.message }]
      });
    }

    if (
      err instanceof Error &&
      (err.message === 'No changes detected' ||
        err.message === 'At least one field must be provided')
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: err.message }]
      });
    }

    throw err;
  }
});

usersRouter.openapi(deleteSelfUserRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }]
    });
  }

  const userId = jwtPayload.userId;

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new DeleteUser(repo);

  try {
    await useCase.execute(userId);
    return c.json(
      { message: 'Current user deleted successfully' },
      StatusCodes.OK
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'user', error: err.message }]
      });
    }
    throw err;
  }
});

usersRouter.openapi(postSelfUserAvatarRequestRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }]
    });
  }

  const userId = jwtPayload.userId;

  const contentType = (c.req.header('content-type') || '').toLowerCase();
  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const maxBytes = 10 * 1024 * 1024;

  if (!contentType.startsWith('multipart/form-data')) {
    throw new HTTPException(StatusCodes.UNSUPPORTED_MEDIA_TYPE, {
      message: 'Unsupported Media Type',
      cause: [
        {
          field: 'content-type',
          error: 'Use multipart/form-data with avatar file field'
        }
      ]
    });
  }

  const body = await c.req.parseBody();

  const keys = Object.keys(body);
  if (keys.length !== 1 || !('avatar' in body)) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [
        {
          field: 'avatar',
          error: "Expected only form.append('avatar', file)"
        }
      ]
    });
  }

  const avatar = body.avatar;
  if (!(avatar instanceof File)) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [{ field: 'avatar', error: 'Avatar must be a file' }]
    });
  }

  if (avatar.size > maxBytes) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [{ field: 'avatar', error: 'Max avatar size is 10MB' }]
    });
  }

  const detected = avatar.type.toLowerCase();
  if (!allowed.has(detected)) {
    throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
      message: 'ValidationError',
      cause: [{ field: 'avatar', error: 'Allowed: png, jpg/jpeg, webp' }]
    });
  }

  const buffer = Buffer.from(await avatar.arrayBuffer());
  const mime = detected as 'image/png' | 'image/jpeg' | 'image/webp';

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new PostUserAvatar(repo);

  try {
    const result = await useCase.execute(userId, buffer, mime);

    return c.json(
      {
        message: 'Avatar uploaded successfully',
        avatar: result.avatar
      },
      StatusCodes.OK
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'user', error: err.message }]
      });
    }
    if (
      err instanceof Error &&
      (err.message.includes('File is corrupted or does not match') ||
        err.message.includes('Unable to process file'))
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: err.message }]
      });
    }
    throw err;
  }
});

export default usersRouter;
