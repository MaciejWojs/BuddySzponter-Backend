import { UserId } from '@/shared/value-objects';

import { User } from '../../domain/entities/User.entity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email, Password, UserNickname } from '../../domain/value-objects';
import { IUserDAO } from '../dao/IUserDAO';
import { UserMapper } from '@/shared/mappers/userMapper';

export class UserRepository implements IUserRepository {
  constructor(protected readonly dao: IUserDAO) {}

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const userExists = await this.dao.findByEmail(user.email.value);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    const result = await this.dao.create({
      email: user.email.value,
      password: user.password.value,
      nickname: user.nickname.value,
    });

    if (!result) {
      throw new Error('Failed to create user');
    }

    const finalUser = UserMapper.toDomain(result);
    return finalUser;
  }

  async findByEmail(email: Email): Promise<User> {
    const result = await this.dao.findByEmail(email.value);
    if (!result) {
      throw new Error('User not found');
    }

    return UserMapper.toDomain(result);
  }

  async findById(id: UserId): Promise<User> {
    const result = await this.dao.findById(id.value);
    if (!result) {
      throw new Error('User not found');
    }

    return new User(
      new UserId(result.id),
      new Email(result.email),
      new UserNickname(result.nickname),
      Password.fromHash(result.password),
      result.isBanned,
      result.createdAt,
      result.updatedAt,
    );
  }

  async updateUser(user: User): Promise<boolean> {
    if (!user.id) {
      throw new Error('User ID is required for update');
    }
    try {
      await this.dao.save({
        id: user.id.value,
        email: user.email.value,
        password: user.password.value,
        nickname: user.nickname.value,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      });
    } catch {
      throw new Error('Failed to update user');
    }

    return true;
  }
  async deleteUser(id: UserId): Promise<boolean> {
    const result = await this.dao.deleteById(id.value);
    if (!result) {
      throw new Error('Failed to delete user');
    }
    return true;
  }
}
