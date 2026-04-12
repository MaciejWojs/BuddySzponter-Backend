import { UserId } from '@shared/value-objects';

import { User } from '../entities/User.entity';
import { Email } from '../value-objects';

export type FindUsersFilters = {
  offset: number;
  limit: number;
  nickname?: string;
  email?: string;
  role?: string;
  isBanned?: boolean;
  isDeleted?: boolean;
};

export interface IUserRepository {
  createUser(user: User): Promise<User>;
  findByEmail(email: Email): Promise<User>;
  countAll(): Promise<number>;
  countFiltered(filters: FindUsersFilters): Promise<number>;
  findById(id: UserId): Promise<User>;
  findMany(offset: number, limit: number): Promise<User[]>;
  findManyFiltered(filters: FindUsersFilters): Promise<User[]>;
  updateUser(user: User): Promise<boolean>;
  deleteUser(id: UserId): Promise<boolean>;
}
