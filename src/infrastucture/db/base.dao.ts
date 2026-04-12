import { db } from './client';

export abstract class BaseDao<
  TDbRecord,
  TInsert,
  TId extends number | string = string
> {
  protected constructor(protected readonly database: typeof db = db) {}

  abstract create(data: TInsert): Promise<TDbRecord | null>;
  abstract deleteById(id: TId): Promise<boolean>;
  abstract findById(id: TId): Promise<TDbRecord | null>;
  abstract save(record: TDbRecord): Promise<TDbRecord>;
}
