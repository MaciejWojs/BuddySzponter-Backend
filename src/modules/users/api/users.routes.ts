import { OpenAPIHono } from '@hono/zod-openapi';
import { randomBytes } from 'crypto';
import { HTTPException } from 'hono/http-exception';
import { StatusCodes } from 'http-status-codes';
import { crop, toPng } from 'imgkit';

import { RepositoryFactory } from '@/infrastucture/factories/RepositoryFactory';
import logger from '@/infrastucture/logger';
import { photosClient } from '@/infrastucture/s3/client';
import { DeleteUser } from '@/modules/users/application/use-case/deleteUser';
import { GetUsersFiltered } from '@/modules/users/application/use-case/getUsersFiltered';
import { GetUsersPaginated } from '@/modules/users/application/use-case/getUsersPaginated';
import { UpdateUser } from '@/modules/users/application/use-case/updateUser';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import { GetAdminUserProfile } from '../application/use-case/getAdminUserProfile';
import {
  deleteUserRoute,
  getUserByIdRoute,
  getUsersFilteredRoute,
  getUsersPaginatedRoute,
  postUserAvatarRequestRoute,
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

usersRouter.openapi(getUsersPaginatedRoute, async (c) => {
  const { offset, limit } = c.req.valid('query');
  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetUsersPaginated(repo);

  const users = await useCase.execute(offset, limit);
  return c.json(users, StatusCodes.OK);
});

usersRouter.openapi(getUsersFilteredRoute, async (c) => {
  const query = c.req.valid('query');
  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new GetUsersFiltered(repo);

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

usersRouter.openapi(updateUserRoute, async (c) => {
  const { id } = c.req.valid('param');
  // const id = c.req.param('id');
  const body = c.req.valid('json');
  const userId = Number(id);

  const repo = new RepositoryFactory().userCacheRepository();
  const useCase = new UpdateUser(repo);
  logger.onlyDev(id);
  try {
    await useCase.execute(userId, body);
    return c.json(
      { message: `User with ID ${id} updated successfully` },
      StatusCodes.OK,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      throw new HTTPException(StatusCodes.NOT_FOUND, { message: err.message });
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

usersRouter.openapi(postUserAvatarRequestRoute, async (c) => {
  const data = await c.req.parseBody();
  const sizes = [320, 640, 1024];
  for (const key in data) {
    console.log(`Key: ${key}, Value: ${data[key]}`);
    if (data[key] instanceof File) {
      const name = randomBytes(16).toString('hex');
      const tasks = sizes.map(async (size) => {
        const t = data[key] as File;
        const temp = await t.arrayBuffer();
        const buffer = Buffer.from(temp);
        const cropped = await crop(buffer, { width: size });
        const result = await toPng(cropped);
        const newName = `${name}/${size}.png`;
        photosClient.write(newName, result);
      });
      tasks.push(
        (async () => {
          const t = data[key] as File;
          const temp = await t.arrayBuffer();
          const buffer = Buffer.from(temp);
          const result = await toPng(buffer);
          const newName = `${name}/original.png`;
          photosClient.write(newName, result);
        })(),
      );
      await Promise.all(tasks);
      return c.json({ message: `Avatar uploaded successfully.` }, 200);
    }
  }
  // Here you would handle the logic for uploading a user's avatar, such as processing the file and storing it in an object storage service.
  return c.json({ message: 'Avatar uploaded successfully' }, 200);
});

export default usersRouter;
