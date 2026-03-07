import { DrizzleUserDao } from '@modules/users/infrastructure/dao/user.dao';

export class DbDaoFactory {
  userDao() {
    return new DrizzleUserDao();
  }
}
