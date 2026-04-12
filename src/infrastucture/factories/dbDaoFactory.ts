import { DrizzleCoreDao } from '@modules/core/infrastructure/dao/core.dao';
import { DrizzleDevicesDao } from '@modules/devices/infrastructure/dao/devices.dao';
import { DrizzleRoleDao } from '@modules/roles/infrastructure/dao/roles.dao';
import { DrizzleUserDao } from '@modules/users/infrastructure/dao/user.dao';

import { DrizzleAuthSessionDAO } from '@/modules/auth/infratsucture/dao/authSession.dao';
import { DrizzleConnectionDao } from '@/modules/connection/infrastructure/dao/connection.dao.db';

export class DbDaoFactory {
  authSessionDao() {
    return new DrizzleAuthSessionDAO();
  }

  connectionDao() {
    return new DrizzleConnectionDao();
  }

  coreDao() {
    return new DrizzleCoreDao();
  }

  devicesDao() {
    return new DrizzleDevicesDao();
  }

  roleDao() {
    return new DrizzleRoleDao();
  }

  userDao() {
    return new DrizzleUserDao();
  }
}
