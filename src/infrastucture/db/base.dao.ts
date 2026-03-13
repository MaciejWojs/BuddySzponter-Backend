import { db } from './client';

export abstract class BaseDao<TDbRecord, TInsert> {
  protected constructor(protected readonly database: typeof db = db) {}

  abstract findById(id: number | string): Promise<TDbRecord | null>;
  abstract create(data: TInsert): Promise<TDbRecord | null>;
  abstract deleteById(id: number | string): Promise<boolean>;
  abstract save(record: TDbRecord): Promise<TDbRecord>;
}
