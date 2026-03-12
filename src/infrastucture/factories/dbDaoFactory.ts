import { DrizzleConnectionDao } from '@modules/connection/infrastructure/dao/connection.dao';
import { DrizzleDevicesDao } from '@modules/devices/infrastructure/dao/devices.dao';
import { DrizzleRoleDao } from '@modules/roles/infrastructure/dao/roles.dao';
import { DrizzleSessionDao } from '@modules/sessions/infrastructure/dao/session.dao';
import { DrizzleUserDao } from '@modules/users/infrastructure/dao/user.dao';

export class DbDaoFactory {
  userDao() {
    return new DrizzleUserDao();
  }

  devicesDao() {
    return new DrizzleDevicesDao();
  }

  sessionDao() {
    return new DrizzleSessionDao();
  }

  roleDao() {
    return new DrizzleRoleDao();
  }

  connectionDao() {
    return new DrizzleConnectionDao();
  }
}
