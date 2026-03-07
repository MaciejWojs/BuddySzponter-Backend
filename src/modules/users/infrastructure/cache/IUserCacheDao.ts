import { UserDbRecord } from '@/shared/types';

export interface IUserCacheDao {
  findById(id: number): Promise<UserDbRecord | null>;
  create(record: UserDbRecord): Promise<UserDbRecord>;
  deleteById(id: number): Promise<boolean>;
  save(record: UserDbRecord): Promise<UserDbRecord>;
}
