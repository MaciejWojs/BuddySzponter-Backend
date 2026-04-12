import { client as cacheClient } from './client';

export abstract class BaseCacheDao<T> {
  protected constructor(protected client = cacheClient) {}

  abstract create(record: T): Promise<T>;
  abstract deleteById(id: number): Promise<boolean>;

  abstract findById(id: number): Promise<T | null>;
  abstract save(record: T): Promise<T>;
}
