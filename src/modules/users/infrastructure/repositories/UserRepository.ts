import { UserMapper } from '@/shared/mappers/userMapper';
import { UserId } from '@/shared/value-objects';

import { User } from '../../domain/entities/User.entity';
import { UserAlreadyExistWithEmailError } from '../../domain/errors/UserAlreadyExistWithEmailError';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email, Password, UserNickname } from '../../domain/value-objects';
import { RoleId } from '../../domain/value-objects/RoleId.vo';
import { RoleName } from '../../domain/value-objects/RoleName.vo';
import { UserRole } from '../../domain/value-objects/userRole.vo';
import { IUserDAO } from '../dao/IUserDAO';

export class UserRepository implements IUserRepository {
  constructor(protected readonly dao: IUserDAO) {}

  async createUser(user: User): Promise<User> {
    const userExists = await this.dao.findByEmail(user.email.value);
    if (userExists) {
      throw new UserAlreadyExistWithEmailError(user.email);
    }

    const result = await this.dao.create({
      email: user.email.value,
      password: user.password.value,
      nickname: user.nickname.value,
      roleId: user.role.id,
      roleName: user.role.name
    });

    if (!result) {
      throw new Error('Failed to create user');
    }

    const finalUser = UserMapper.toDomain(result);
    return finalUser;
  }

  async deleteUser(id: UserId): Promise<boolean> {
    const result = await this.dao.deleteById(id.value);
    if (!result) {
      throw new Error('Failed to delete user');
    }
    return true;
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
      new UserRole(new RoleId(result.roleId), new RoleName(result.roleName)),
      result.isBanned,
      result.isDeleted,
      result.avatar,
      result.createdAt,
      result.updatedAt
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
        isDeleted: user.isDeleted,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: new Date(),
        roleId: user.role.id
      });
    } catch {
      throw new Error('Failed to update user');
    }

    return true;
  }
}
