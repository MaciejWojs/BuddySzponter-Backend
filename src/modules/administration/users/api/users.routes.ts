import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import { DeleteUser } from '@/modules/users/application/use-case/deleteUser';
import { PostUserAvatar } from '@/modules/users/application/use-case/postUserAvatar';
import { UpdateUser } from '@/modules/users/application/use-case/updateUser';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { DeleteUserDevice } from '../application/use-case/deleteUserDevice';
import { DeleteUserDevices } from '../application/use-case/deleteUserDevices';
import { GetAdminUserProfile } from '../application/use-case/getAdminUserProfile';
import { GetUserDevices } from '../application/use-case/getUserDevices';
import { GetUsers } from '../application/use-case/getUsers';
import { GetUserSessions } from '../application/use-case/getUserSessions';
import {
  deleteUserDeviceRoute,
  deleteUserDevicesRoute,
  deleteUserRoute,
  getUserByIdRoute,
  getUserDevicesRoute,
  getUserSessionsRoute,
  getUsersRoute,
  postUserAvatarRequestRoute,
  updateUserRoute,
} from './users.openapi';

const administrationUsersRouter = new OpenAPIHono<ENV>({ defaultHook });

administrationUsersRouter.openapi(getUsersRoute, async (c) => {
  const query = c.req.valid('query');
  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetUsers(repo);

  const users = await useCase.execute(query);
  return c.json(users, StatusCodes.OK);
});

administrationUsersRouter.openapi(getUserByIdRoute, async (c) => {
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

administrationUsersRouter.openapi(getUserDevicesRoute, async (c) => {
  const { id } = c.req.valid('param');
  const userId = Number(id);

  const devicesRepository = new RepositoryFactory().deviceRepository();
  const useCase = new GetUserDevices(devicesRepository);

  const devices = await useCase.execute(userId);
  return c.json(devices, StatusCodes.OK);
});

administrationUsersRouter.openapi(getUserSessionsRoute, async (c) => {
  const { id } = c.req.valid('param');
  const userId = Number(id);

  const authSessionRepository = new RepositoryFactory().authSessionRepository();
  const useCase = new GetUserSessions(authSessionRepository);

  const sessions = await useCase.execute(userId);
  return c.json(sessions, StatusCodes.OK);
});

administrationUsersRouter.openapi(deleteUserDevicesRoute, async (c) => {
  const { id } = c.req.valid('param');
  const userId = Number(id);

  const devicesRepository = new RepositoryFactory().deviceRepository();
  const useCase = new DeleteUserDevices(devicesRepository);

  const deletedCount = await useCase.execute(userId);
  return c.json(
    { message: `Deleted ${deletedCount} device(s) for user with ID ${id}` },
    StatusCodes.OK,
  );
});

administrationUsersRouter.openapi(deleteUserDeviceRoute, async (c) => {
  const { id, deviceId } = c.req.valid('param');
  const userId = Number(id);

  const devicesRepository = new RepositoryFactory().deviceRepository();
  const useCase = new DeleteUserDevice(devicesRepository);

  try {
    await useCase.execute(userId, deviceId);
    return c.json(
      {
        message: `Device ${deviceId} deleted for user with ID ${id}`,
      },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'deviceId', error: err.message }],
      });
    }
    throw err;
  }
});

administrationUsersRouter.openapi(updateUserRoute, async (c) => {
  const jwtPayload = c.get('jwt-payload');
  if (!jwtPayload) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
      cause: [{ field: 'authorization', error: 'Missing or invalid token' }],
    });
  }

  const { id } = c.req.valid('param');
  const targetUserId = Number(id);
  const body = c.req.valid('json');

  const factory = new RepositoryFactory();
  const repo = factory.userCacheRepository();
  const roleDao = factory.dao.db.roleDao();
  const useCase = new UpdateUser(repo, roleDao);

  try {
    await useCase.execute(jwtPayload.userId, targetUserId, body);
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

    if (err instanceof Error && err.message === 'Cannot change own role') {
      throw new HTTPException(StatusCodes.FORBIDDEN, {
        message: 'Forbidden',
        cause: [{ field: 'roleId', error: err.message }],
      });
    }

    if (err instanceof Error && err.message === 'Role not found') {
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'roleId', error: err.message }],
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
        cause: [{ field: 'body', error: err.message }],
      });
    }

    throw err;
  }
});

administrationUsersRouter.openapi(deleteUserRoute, async (c) => {
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
      throw new HTTPException(StatusCodes.NOT_FOUND, {
        message: 'NotFoundError',
        cause: [{ field: 'id', error: err.message }],
      });
    }
    throw err;
  }
});

administrationUsersRouter.openapi(postUserAvatarRequestRoute, async (c) => {
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

export default administrationUsersRouter;
