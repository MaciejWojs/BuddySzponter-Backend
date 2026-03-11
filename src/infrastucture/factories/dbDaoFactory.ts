import { DrizzleUserDao } from '@modules/users/infrastructure/dao/user.dao';

import { DrizzleSessionDao } from '@/modules/sessions/infratsucture/dao/session.dao';

export class DbDaoFactory {
  userDao() {
    return new DrizzleUserDao();
  }

  sessionDao() {
    return new DrizzleSessionDao();
  }
}
