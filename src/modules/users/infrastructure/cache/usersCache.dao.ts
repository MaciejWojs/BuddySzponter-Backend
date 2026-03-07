import { UserDbRecord } from '@/shared/types';
import { IUserCacheDao } from './IUserCacheDao';
import { BaseCacheDao } from '@/infrastucture/cache/baseCache.dao';
import logger from '@/infrastucture/logger';

export class UsersCacheDao
  extends BaseCacheDao<UserDbRecord>
  implements IUserCacheDao
{
  static TTL = 60;
  constructor() {
    super();
  }

  override async findById(id: number): Promise<UserDbRecord | null> {
    const key = `user:${id}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  override async create(record: UserDbRecord): Promise<UserDbRecord> {
    const key = `user:${record.id}`;
    const result = await this.client.setex(
      key,
      UsersCacheDao.TTL,
      JSON.stringify(record),
    );
    if (result !== 'OK') {
      logger.error(`Failed to create cache record { ${key}, ${record} }`);
      throw new Error('Failed to create cache record');
    }
    return record;
  }
  override async deleteById(id: number): Promise<boolean> {
    const key = `user:${id}`;
    const result = await this.client.del(key);
    return result > 0;
  }
  override async save(record: UserDbRecord): Promise<UserDbRecord> {
    const key = `user:${record.id}`;
    const result = await this.client.setex(
      key,
      UsersCacheDao.TTL,
      JSON.stringify(record),
    );
    if (result !== 'OK') {
      throw new Error('Failed to save cache record');
    }
    return record;
  }
}
