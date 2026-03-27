import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import logger from '@/infrastucture/logger';
import { DeleteUser } from '@/modules/users/application/use-case/deleteUser';
import { GetUsers } from '@/modules/users/application/use-case/getUsers';
import { GetUsersTotal } from '@/modules/users/application/use-case/getUsersTotal';
import { PostUserAvatar } from '@/modules/users/application/use-case/postUserAvatar';
import { UpdateUser } from '@/modules/users/application/use-case/updateUser';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { GetAdminUserProfile } from '../application/use-case/getAdminUserProfile';
import {
  deleteUserRoute,
  getUserByIdRoute,
  getUsersRoute,
  getUsersTotalRoute,
  postSelfAvatarRequestRoute,
  postUserAvatarRequestRoute,
  updateSelfRoute,
  updateUserRoute,
} from './user.openapi';

const usersRouter = new OpenAPIHono<ENV>({ defaultHook });

// usersRouter.openapi(getUsersPaginatedRoute, (c) => {
//   return c.json({ message: 'Users endpoint' });
// });

// usersRouter.openapi(getUserByIdRoute, (c) => {
//   const { id } = c.req.param();
//   // Here you would handle the logic for retrieving a user by their ID, such as querying a database.
//   return c.json({ message: `User with ID ${id} retrieved successfully` });
// });

usersRouter.openapi(getUsersTotalRoute, async (c) => {
  const query = c.req.valid('query');
  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetUsersTotal(repo);

  const total = await useCase.execute(query);
  return c.json({ total }, StatusCodes.OK);
});

usersRouter.openapi(getUsersRoute, async (c) => {
  const query = c.req.valid('query');
  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetUsers(repo);

  const users = await useCase.execute(query);
  return c.json(users, StatusCodes.OK);
});

usersRouter.openapi(getUserByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const userId = Number(id);

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetAdminUserProfile(repo);

  try {
    const user = await useCase.execute(userId);
    return c.json(user, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, { message: err.message });
    }
    throw err;
  }
});

usersRouter.openapi(updateSelfRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');

  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }],
    });
  }

  const body = c.req.valid('json');

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new UpdateUser(repo);

  try {
    await useCase.execute(jwtPayload.userId, jwtPayload.userId, body);
    return c.json({ message: 'Profile updated successfully' }, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') {
      throw new HTTPException(StatusCodes.FORBIDDEN, {
        message: 'Forbidden',
        cause: [{ field: 'authorization', error: 'Insufficient permissions' }],
      });
    }

    if (
      err instanceof Error &&
      (err.message === 'Forbidden fields for self update' ||
        err.message === 'No changes detected' ||
        err.message === 'At least one field must be provided')
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: err.message }],
      });
    }

    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'userId', error: err.message }],
      });
    }

    throw err;
  }
});

usersRouter.openapi(updateUserRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }],
    });
  }

  const { id } = c.req.valid('param');
  const userId = Number(id);
  const body = c.req.valid('json');

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new UpdateUser(repo);
  logger.onlyDev(id);
  try {
    await useCase.execute(jwtPayload.userId, userId, body);
    return c.json(
      { message: `User with ID ${id} updated successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') {
      throw new HTTPException(StatusCodes.FORBIDDEN, {
        message: 'Forbidden',
        cause: [{ field: 'authorization', error: 'Insufficient permissions' }],
      });
    }

    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }

    if (
      err instanceof Error &&
      (err.message === 'No changes detected' ||
        err.message === 'At least one field must be provided')
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: 'At least one field must be changed' }],
      });
    }

    throw err;
  }
});

usersRouter.openapi(deleteUserRoute, async (c) => {
  const { id } = c.req.valid('param');
  const userId = Number(id);

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new DeleteUser(repo);

  try {
    await useCase.execute(userId);
    return c.json(
      { message: `User with ID ${id} deleted successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, { message: err.message });
    }
    throw err;
  }
});

// usersRouter.openapi(postUserAvatarRequestRoute, async (c) => {
//   const data = await c.req.parseBody();
//   const sizes = [128, 256, 512];
//   for (const key in data) {
//     console.log(`Key: ${key}, Value: ${data[key]}`);
//     if (data[key] instanceof File) {
//       const name = randomBytes(16).toString('hex');
//       const tasks = sizes.map(async (size) => {
//         const t = data[key] as File;
//         const temp = await t.arrayBuffer();
//         const buffer = Buffer.from(temp);
//         const cropped = await resize(buffer, { width: size });
//         const result = await toPng(cropped);
//         const newName = `${name}/${size}.png`;
//         photosClient.write(newName, result);
//       });
//       tasks.push(
//         (async () => {
//           const t = data[key] as File;
//           const temp = await t.arrayBuffer();
//           const buffer = Buffer.from(temp);
//           const result = await toPng(buffer);
//           const newName = `${name}/original.png`;
//           photosClient.write(newName, result);
//         })(),
//       );
//       await Promise.all(tasks);
//       return c.json({ message: `Avatar uploaded successfully.` }, 200);
//     }
//   }
//   // Here you would handle the logic for uploading a user's avatar, such as processing the file and storing it in an object storage service.
//   return c.json({ message: 'Avatar uploaded successfully' }, 200);
// });

usersRouter.openapi(postSelfAvatarRequestRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }],
    });
  }

  const userId = Number(jwtPayload.userId);

  const contentType = (c.req.header('content-type') || '').toLowerCase();
  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const maxBytes = 10 * 1024 * 1024;

  let buffer: Buffer;
  let mime: 'image/png' | 'image/jpeg' | 'image/webp';

  if (contentType.startsWith('multipart/form-data')) {
    const body = await c.req.parseBody();

    const keys = Object.keys(body);
    if (keys.length !== 1 || !('avatar' in body)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [
          {
            field: 'avatar',
            error: "Expected only form.append('avatar', file)",
          },
        ],
      });
    }

    const avatar = body.avatar;
    if (!(avatar instanceof File)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Avatar must be a file' }],
      });
    }

    if (avatar.size > maxBytes) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Max avatar size is 10MB' }],
      });
    }

    const detected = avatar.type.toLowerCase();
    if (!allowed.has(detected)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Allowed: png, jpg/jpeg, webp' }],
      });
    }

    buffer = Buffer.from(await avatar.arrayBuffer());
    mime = detected as 'image/png' | 'image/jpeg' | 'image/webp';
  } else {
    const rawMime = contentType.split(';')[0]?.trim();
    if (!rawMime || !allowed.has(rawMime)) {
      throw new HTTPException(StatusCodes.UNSUPPORTED_MEDIA_TYPE, {
        message: 'Unsupported Media Type',
        cause: [
          {
            field: 'content-type',
            error:
              'Use multipart/form-data (avatar) or raw image/png|jpeg|webp',
          },
        ],
      });
    }

    const ab = await c.req.arrayBuffer();
    buffer = Buffer.from(ab);

    if (buffer.length === 0 || buffer.length > maxBytes) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: 'Invalid image size (1B - 10MB)' }],
      });
    }

    mime = rawMime as 'image/png' | 'image/jpeg' | 'image/webp';
  }

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new PostUserAvatar(repo);

  try {
    const result = await useCase.execute(userId, buffer, mime);

    return c.json(
      {
        message: 'Avatar uploaded successfully',
        avatar: result.avatar,
        hash: result.hash,
      },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'userId', error: err.message }],
      });
    }

    if (
      err instanceof Error &&
      (err.message.includes('Plik uszkodzony lub niezgodny') ||
        err.message.includes('Nie można przetworzyć pliku'))
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: err.message }],
      });
    }

    throw err;
  }
});

usersRouter.openapi(postUserAvatarRequestRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }],
    });
  }

  const { id } = c.req.valid('param');
  const userId = Number(id);

  const contentType = (c.req.header('content-type') || '').toLowerCase();
  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
  const maxBytes = 10 * 1024 * 1024;

  let buffer: Buffer;
  let mime: 'image/png' | 'image/jpeg' | 'image/webp';

  if (contentType.startsWith('multipart/form-data')) {
    const body = await c.req.parseBody();

    const keys = Object.keys(body);
    if (keys.length !== 1 || !('avatar' in body)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [
          {
            field: 'avatar',
            error: "Expected only form.append('avatar', file)",
          },
        ],
      });
    }

    const avatar = body.avatar;
    if (!(avatar instanceof File)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Avatar must be a file' }],
      });
    }

    if (avatar.size > maxBytes) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Max avatar size is 10MB' }],
      });
    }

    const detected = avatar.type.toLowerCase();
    if (!allowed.has(detected)) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: 'Allowed: png, jpg/jpeg, webp' }],
      });
    }

    buffer = Buffer.from(await avatar.arrayBuffer());
    mime = detected as 'image/png' | 'image/jpeg' | 'image/webp';
  } else {
    const rawMime = contentType.split(';')[0]?.trim();
    if (!rawMime || !allowed.has(rawMime)) {
      throw new HTTPException(StatusCodes.UNSUPPORTED_MEDIA_TYPE, {
        message: 'Unsupported Media Type',
        cause: [
          {
            field: 'content-type',
            error:
              'Use multipart/form-data (avatar) or raw image/png|jpeg|webp',
          },
        ],
      });
    }

    const ab = await c.req.arrayBuffer();
    buffer = Buffer.from(ab);

    if (buffer.length === 0 || buffer.length > maxBytes) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'body', error: 'Invalid image size (1B - 10MB)' }],
      });
    }

    mime = rawMime as 'image/png' | 'image/jpeg' | 'image/webp';
  }

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new PostUserAvatar(repo);

  try {
    const result = await useCase.execute(userId, buffer, mime);

    return c.json(
      {
        message: 'Avatar uploaded successfully',
        avatar: result.avatar,
        hash: result.hash,
      },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }
    if (
      err instanceof Error &&
      (err.message.includes('Plik uszkodzony lub niezgodny') ||
        err.message.includes('Nie można przetworzyć pliku'))
    ) {
      throw new HTTPException(StatusCodes.UNPROCESSABLE_ENTITY, {
        message: 'ValidationError',
        cause: [{ field: 'avatar', error: err.message }],
      });
    }
    throw err;
  }
});

export default usersRouter;
