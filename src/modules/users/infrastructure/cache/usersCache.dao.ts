import { BaseCacheDao } from '@infra/cache/baseCache.dao';

import { APP_CONFIG } from '@/config/appConfig';
import { UserDbRecord } from '@/shared/types';

import { IUserCacheDao } from './IUserCacheDao';

export class UsersCacheDao
  extends BaseCacheDao<UserDbRecord>
  implements IUserCacheDao
{
  constructor() {
    super();
  }

  override async create(record: UserDbRecord): Promise<UserDbRecord> {
    const key = `${APP_CONFIG.cache.keys.userPrefix}${record.id}`;
    const result = await this.client.setex(
      key,
      APP_CONFIG.cache.ttl.user,
      JSON.stringify(record)
    );
    if (result !== 'OK') {
      throw new Error('Failed to create cache record');
    }
    return record;
  }

  override async deleteById(id: number): Promise<boolean> {
    const key = `${APP_CONFIG.cache.keys.userPrefix}${id}`;
    const result = await this.client.del(key);
    return result > 0;
  }

  override async findById(id: number): Promise<UserDbRecord | null> {
    const key = `${APP_CONFIG.cache.keys.userPrefix}${id}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  override async save(record: UserDbRecord): Promise<UserDbRecord> {
    const key = `${APP_CONFIG.cache.keys.userPrefix}${record.id}`;
    const result = await this.client.setex(
      key,
      APP_CONFIG.cache.ttl.user,
      JSON.stringify(record)
    );
    if (result !== 'OK') {
      throw new Error('Failed to save cache record');
    }
    return record;
  }
}
