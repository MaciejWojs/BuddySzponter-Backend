import { UsersCacheDao } from 'src/modules/users/infrastructure/cache/usersCache.dao';

export class CacheDaoFactory {
  UsersCacheDao() {
    return new UsersCacheDao();
  }
}
