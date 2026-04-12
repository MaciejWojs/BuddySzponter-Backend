import { CacheDaoFactory } from './cacheDaoFactory';
import { DbDaoFactory } from './dbDaoFactory';

export class DaoFactory {
  readonly cache: CacheDaoFactory;

  readonly db: DbDaoFactory;

  constructor() {
    this.db = new DbDaoFactory();
    this.cache = new CacheDaoFactory();
  }
}
