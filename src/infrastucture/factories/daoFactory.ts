import { CacheDaoFactory } from './cacheDaoFactory';
import { DbDaoFactory } from './dbDaoFactory';

export class DaoFactory {
  readonly db: DbDaoFactory;
  readonly cache: CacheDaoFactory;

  constructor() {
    this.db = new DbDaoFactory();
    this.cache = new CacheDaoFactory();
  }
}
