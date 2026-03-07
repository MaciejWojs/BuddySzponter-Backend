import { RegisterInput } from '@modules/auth/api/auth.schema';

import { UserDbRecord } from '@/shared/types';

export type CreateUser = Omit<RegisterInput, 'passwordConfirm'>;

export interface IUserDAO {
  findById(id: number): Promise<UserDbRecord | null>;
  findByEmail(email: string): Promise<UserDbRecord | null>;
  create(data: CreateUser): Promise<UserDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  deleteByEmail(email: string): Promise<boolean>;
  save(user: UserDbRecord): Promise<UserDbRecord>;
}
