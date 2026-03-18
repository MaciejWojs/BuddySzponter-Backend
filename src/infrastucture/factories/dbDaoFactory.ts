import { DrizzleDevicesDao } from '@modules/devices/infrastructure/dao/devices.dao';
import { DrizzleRoleDao } from '@modules/roles/infrastructure/dao/roles.dao';
import { DrizzleUserDao } from '@modules/users/infrastructure/dao/user.dao';
import { DrizzleCoreDao } from '@modules/core/infrastructure/dao/core.dao';

import { DrizzleConnectionDao } from '@/modules/connection/infrastructure/dao/connection.dao.db';

export class DbDaoFactory {
  userDao() {
    return new DrizzleUserDao();
  }

  devicesDao() {
    return new DrizzleDevicesDao();
  }

  roleDao() {
    return new DrizzleRoleDao();
  }

  connectionDao() {
    return new DrizzleConnectionDao();
  }

  coreDao() {
    return new DrizzleCoreDao();
  }
}
