import { UserDbRecord } from '@/shared/types';
import type { UserDbRecordWithRole } from '@/shared/types/UserDB';

export type CreateUser = {
  email: string;
  password: string;
  nickname: string;
  roleId: number;
  roleName: string;
};

export interface IUserDAO {
  findById(id: number): Promise<UserDbRecordWithRole | null>;
  findByEmail(email: string): Promise<UserDbRecordWithRole | null>;
  create(data: CreateUser): Promise<UserDbRecordWithRole | null>;
  deleteById(id: number): Promise<boolean>;
  deleteByEmail(email: string): Promise<boolean>;
  save(user: UserDbRecord): Promise<UserDbRecord>;
}
