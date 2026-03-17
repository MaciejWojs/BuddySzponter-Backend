import { RedisClient } from 'bun';

export const client = new RedisClient();

export const initCache = async () => {
  await client.connect();
};
