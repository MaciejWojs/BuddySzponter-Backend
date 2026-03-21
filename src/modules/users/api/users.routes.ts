import { randomBytes } from 'crypto';
import { Hono } from 'hono';
import { crop, toPng } from 'imgkit';

import { photosClient } from '@/infrastucture/s3/client';
import { isAdmin } from '@/shared/api/middleware/isAdmin';

const usersRouter = new Hono();

usersRouter.get('/', isAdmin, (c) => {
  return c.json({ message: 'Users endpoint' });
});

usersRouter.get('/:id', (c) => {
  const { id } = c.req.param();
  // Here you would handle the logic for retrieving a user by their ID, such as querying a database.
  return c.json({ message: `User with ID ${id} retrieved successfully` });
});

usersRouter.patch('/:id', (c) => {
  const { id } = c.req.param();
  // Here you would handle the logic for updating a user by their ID, such as validating input and modifying user data.
  return c.json({ message: `User with ID ${id} updated successfully` });
});

usersRouter.delete('/:id', (c) => {
  const { id } = c.req.param();
  // Here you would handle the logic for deleting a user by their ID, such as validating the ID and removing user data.
  return c.json({ message: `User with ID ${id} deleted successfully` });
});

usersRouter.post('/upload-avatar', async (c) => {
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
        const newName = `${name}_${size}.png`;
        photosClient.write(newName, result);
      });
      tasks.push(
        (async () => {
          const t = data[key] as File;
          const temp = await t.arrayBuffer();
          const buffer = Buffer.from(temp);
          const result = await toPng(buffer);
          const newName = `${name}_original.png`;
          photosClient.write(newName, result);
        })(),
      );
      await Promise.all(tasks);
      return c.json({ message: photosClient.file(name) });
    }
  }
  // Here you would handle the logic for uploading a user's avatar, such as processing the file and storing it in an object storage service.
  return c.json({ message: 'Avatar uploaded successfully' });
});

export default usersRouter;
