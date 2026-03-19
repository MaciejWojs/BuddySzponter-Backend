import { User } from '@/modules/users/domain/entities/User.entity';
import {
  Email,
  Password,
  UserNickname,
} from '@/modules/users/domain/value-objects';
import { RoleId } from '@/modules/users/domain/value-objects/RoleId.vo';
import { RoleName } from '@/modules/users/domain/value-objects/RoleName.vo';
import { UserRole } from '@/modules/users/domain/value-objects/userRole.vo';

import { ValidationError } from '../errors/Specialized/ValidationError';
import { UserDbRecord } from '../types';
import { UserDbRecordWithRole } from '../types/UserDB';
import { UserId } from '../value-objects';

export class UserMapper {
  static toDomain(userDbRecord: UserDbRecordWithRole): User {
    let user;

    try {
      user = new User(
        new UserId(userDbRecord.id),
        new Email(userDbRecord.email),
        new UserNickname(userDbRecord.nickname),
        Password.fromHash(userDbRecord.password),
        new UserRole(
          new RoleId(userDbRecord.roleId),
          new RoleName(userDbRecord.roleName),
        ),
        userDbRecord.isBanned,
        userDbRecord.isDeleted,
        userDbRecord.avatar,
        userDbRecord.createdAt,
        userDbRecord.updatedAt,
      );
    } catch (err) {
      if (err instanceof ValidationError) {
        throw err;
      }
      throw new Error('Failed to map user record to domain entity', {
        cause: err,
      });
    }

    return user;
  }

  static toPersistence(user: User): UserDbRecord {
    if (!user.id) {
      throw new Error('User ID is required for persistence');
    }

    return {
      id: user.id.value,
      email: user.email.value,
      nickname: user.nickname.value,
      password: user.password.value,
      roleId: user.role.id,
      isBanned: user.isBanned,
      isDeleted: user.isDeleted,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
