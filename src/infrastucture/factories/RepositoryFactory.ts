import { AuthSessionRepository } from '@/modules/auth/infratsucture/repositories/AuthSessionRepository';
import { ConnectionRepository } from '@/modules/connection/infrastructure/repositories/ConnectionRepository';
import { DeviceRepository } from '@/modules/devices/infrastructure/repositories/DeviceRepository';
import { UserCacheRepository } from '@/modules/users/infrastructure/repositories/UserCacheRepository';
import { UserRepository } from '@/modules/users/infrastructure/repositories/UserRepository';

import { client } from '../cache/client';
import { DaoFactory } from './daoFactory';

export class RepositoryFactory {
  readonly dao: DaoFactory;

  constructor() {
    this.dao = new DaoFactory();
  }

  userRepository() {
    return new UserRepository(this.dao.db.userDao());
  }

  userCacheRepository() {
    return new UserCacheRepository(this.userRepository(), client);
  }

  authSessionRepository() {
    return new AuthSessionRepository(this.dao.db.authSessionDao());
  }

  deviceRepository() {
    return new DeviceRepository(this.dao.db.devicesDao());
  }

  connectionRepository() {
    return new ConnectionRepository();
  }
}
