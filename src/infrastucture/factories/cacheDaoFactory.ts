import { UsersCacheDao } from '@modules/users/infrastructure/cache/usersCache.dao';

export class CacheDaoFactory {
  usersCacheDao() {
    return new UsersCacheDao();
  }
}
