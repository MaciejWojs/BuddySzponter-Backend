import { RegisterInput } from '@modules/auth/api/schemas/auth.requests.schema';

import { UserDbRecord } from '@/shared/types';
import type { UserDbRecordWithRole } from '@/shared/types/UserDB';

export type CreateUser = Omit<RegisterInput, 'passwordConfirm'>;

export interface IUserDAO {
  findById(id: number): Promise<UserDbRecordWithRole | null>;
  findByEmail(email: string): Promise<UserDbRecordWithRole | null>;
  create(data: CreateUser): Promise<UserDbRecordWithRole | null>;
  deleteById(id: number): Promise<boolean>;
  deleteByEmail(email: string): Promise<boolean>;
  save(user: UserDbRecord): Promise<UserDbRecord>;
}
