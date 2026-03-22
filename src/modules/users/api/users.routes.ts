import { OpenAPIHono } from '@hono/zod-openapi';
import { randomBytes } from 'crypto';
import { crop, toPng } from 'imgkit';

import { photosClient } from '@/infrastucture/s3/client';
import { defaultHook } from '@/shared/api/openapi/defaultHook';
import { ENV } from '@/shared/types/honoENV';

import {
  deleteUserRoute,
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

usersRouter.openapi(updateUserRoute, (c) => {
  const { id } = c.req.param();
  // Here you would handle the logic for updating a user by their ID, such as validating input and modifying user data.
  return c.json({ message: `User with ID ${id} updated successfully` }, 200);
});

usersRouter.openapi(deleteUserRoute, (c) => {
  const { id } = c.req.param();
  // Here you would handle the logic for deleting a user by their ID, such as validating the ID and removing user data.
  return c.json({ message: `User with ID ${id} deleted successfully` }, 200);
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
      // console.log('Uploaded files:', uploadedFiles);
      return c.json({ message: `Avatar uploaded successfully.` }, 200);
    }
  }
  // Here you would handle the logic for uploading a user's avatar, such as processing the file and storing it in an object storage service.
  return c.json({ message: 'Avatar uploaded successfully' }, 200);
});

export default usersRouter;
