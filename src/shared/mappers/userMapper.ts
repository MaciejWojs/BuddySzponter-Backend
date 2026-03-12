import { User } from '@/modules/users/domain/entities/User.entity';
import {
  Email,
  Password,
  UserNickname,
} from '@/modules/users/domain/value-objects';

import { ValidationError } from '../errors/Specialized/ValidationError';
import { UserDbRecord } from '../types';
import { UserId } from '../value-objects';

export class UserMapper {
  static toDomain(userDbRecord: UserDbRecord): User {
    let user;

    try {
      user = new User(
        new UserId(userDbRecord.id),
        new Email(userDbRecord.email),
        new UserNickname(userDbRecord.nickname),
        Password.fromHash(userDbRecord.password),
        userDbRecord.isBanned,
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
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
