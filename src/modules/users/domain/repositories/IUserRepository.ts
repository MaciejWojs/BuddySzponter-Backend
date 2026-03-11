import { UserId } from '@shared/value-objects';

import { User } from '../entities/User.entity';
import { Email } from '../value-objects';

export interface IUserRepository {
  createUser(user: Omit<User, 'id'>): Promise<User>;
  findByEmail(email: Email): Promise<User>;
  findById(id: UserId): Promise<User>;
  updateUser(user: User): Promise<boolean>;
  deleteUser(id: UserId): Promise<boolean>;
}
