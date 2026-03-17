import { APP_CONFIG } from '@/config/appConfig';
import type { client } from '@/infrastucture/cache/client';
import { UserId } from '@/shared/value-objects';

import { User } from '../../domain/entities/User.entity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email, Password, UserNickname } from '../../domain/value-objects';
import { RoleId } from '../../domain/value-objects/RoleId.vo';
import { RoleName } from '../../domain/value-objects/RoleName.vo';
import { UserRole } from '../../domain/value-objects/userRole.vo';

type CachedUserPayload = {
  email: string;
  nickname: string;
  password: string;
  roleId: number;
  roleName: string;
  isBanned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export class UserCacheRepository implements IUserRepository {
  constructor(
    protected readonly repository: IUserRepository,
    protected readonly cacheClient: typeof client,
  ) {}

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const createdUser = await this.repository.createUser(user);

    if (!this.cacheClient.connected) {
      console.warn('Cache client is not connected. Skipping cache write.');
      return createdUser;
    }

    const cacheKey = `${APP_CONFIG.cache.keys.userPrefix}${user.email.value}`;

    try {
      const cacheValue = this.serializeUser(user);
      await this.cacheClient.setex(
        cacheKey,
        APP_CONFIG.cache.ttl.user,
        cacheValue,
      );

      if (createdUser.id) {
        const emailIdKey = `${APP_CONFIG.cache.keys.userIdPrefix}${createdUser.id.value}`;
        await this.cacheClient.setex(
          emailIdKey,
          APP_CONFIG.cache.ttl.user,
          String(createdUser.email.value),
        );
      }
    } catch {
      throw new Error('Failed to serialize user for caching');
    }

    return createdUser;
  }

  async findByEmail(email: Email): Promise<User> {
    const cacheKey = `${APP_CONFIG.cache.keys.userPrefix}${email.value}`;

    if (this.cacheClient.connected) {
      const cachedUser = await this.cacheClient.get(cacheKey);
      if (cachedUser) {
        try {
          return this.deserializeUser(cachedUser);
        } catch (err) {
          console.warn(
            'Failed to parse cached user data. Falling back to DB.',
            err,
          );
        }
      }
    } else {
      console.warn('Cache client is not connected. Skipping cache read.');
    }

    const userFromDb = await this.repository.findByEmail(email);

    if (userFromDb) {
      try {
        const cacheValue = this.serializeUser(userFromDb);
        await this.cacheClient.setex(
          cacheKey,
          APP_CONFIG.cache.ttl.user,
          cacheValue,
        );
      } catch (err) {
        console.warn('Failed to serialize user for caching', err);
      }
    }
    return userFromDb;
  }
  async findById(id: UserId): Promise<User> {
    const cacheKey = `${APP_CONFIG.cache.keys.userIdPrefix}${id.value}`;

    if (this.cacheClient.connected) {
      const cachedEmail = await this.cacheClient.get(cacheKey);
      if (cachedEmail) {
        return this.findByEmail(new Email(cachedEmail));
      }
    } else {
      console.warn('Cache client is not connected. Skipping cache read.');
    }

    const userFromDb = await this.repository.findById(id);

    if (userFromDb) {
      try {
        const emailCacheKey = `${APP_CONFIG.cache.keys.userPrefix}${userFromDb.email.value}`;
        const cacheValue = this.serializeUser(userFromDb);
        await this.cacheClient.setex(
          emailCacheKey,
          APP_CONFIG.cache.ttl.user,
          cacheValue,
        );
        const emailIdKey = `${APP_CONFIG.cache.keys.userIdPrefix}${userFromDb.id?.value}`;
        await this.cacheClient.setex(
          emailIdKey,
          APP_CONFIG.cache.ttl.user,
          String(userFromDb.email.value),
        );
      } catch (err) {
        console.warn('Failed to serialize user for caching', err);
      }
    }
    return userFromDb;
  }

  async updateUser(user: User): Promise<boolean> {
    const updated = await this.repository.updateUser(user);

    if (!updated) {
      return false;
    }

    const cacheKey = `${APP_CONFIG.cache.keys.userPrefix}${user.email.value}`;

    try {
      const cacheValue = this.serializeUser(user);
      await this.cacheClient.setex(
        cacheKey,
        APP_CONFIG.cache.ttl.user,
        cacheValue,
      );
    } catch (err) {
      console.warn('Failed to serialize user for caching', err);
      // Return true since the DB update succeeded, even if caching failed
      return true;
    }

    return true;
  }

  async deleteUser(id: UserId): Promise<boolean> {
    const deleted = await this.repository.deleteUser(id);

    if (!deleted) {
      return false;
    }

    const emailIdKey = `${APP_CONFIG.cache.keys.userIdPrefix}${id.value}`;
    const cachedEmail = await this.cacheClient.get(emailIdKey);

    if (cachedEmail) {
      const cacheKey = `${APP_CONFIG.cache.keys.userPrefix}${cachedEmail}`;
      await this.cacheClient.del(cacheKey);
      await this.cacheClient.del(emailIdKey);
    }

    return true;
  }

  private serializeUser(user: Omit<User, 'id'> | User): string {
    return JSON.stringify({
      email: user.email.value,
      nickname: user.nickname.value,
      password: user.password.value,
      roleId: user.role.id,
      roleName: user.role.name,
      isBanned: user.isBanned,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    } satisfies CachedUserPayload);
  }

  private deserializeUser(value: string): User {
    const parsed = JSON.parse(value) as CachedUserPayload;

    return new User(
      null,
      new Email(parsed.email),
      new UserNickname(parsed.nickname),
      Password.fromHash(parsed.password),
      new UserRole(new RoleId(parsed.roleId), new RoleName(parsed.roleName)),
      parsed.isBanned,
      parsed.isDeleted,
      new Date(parsed.createdAt),
      new Date(parsed.updatedAt),
    );
  }
}
