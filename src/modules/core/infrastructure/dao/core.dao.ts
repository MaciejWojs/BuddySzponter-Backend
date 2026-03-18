import { BaseDao } from '@infra/db/base.dao';
import { appVersionTable } from '@infra/db/schema';
import { eq } from 'drizzle-orm';

import { AppVersionDbRecord, CreateAppVersion, ICoreDao } from './ICoreDao';

export class DrizzleCoreDao
  extends BaseDao<AppVersionDbRecord, CreateAppVersion, number>
  implements ICoreDao
{
  constructor() {
    super();
  }

  override async findById(id: number): Promise<AppVersionDbRecord | null> {
    const rows = await this.database
      .select()
      .from(appVersionTable)
      .where(eq(appVersionTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findSupportedVersions(): Promise<AppVersionDbRecord[]> {
    return this.database
      .select()
      .from(appVersionTable)
      .where(eq(appVersionTable.isSupported, true));
  }

  override async create(
    data: CreateAppVersion,
  ): Promise<AppVersionDbRecord | null> {
    const [created] = await this.database
      .insert(appVersionTable)
      .values(data)
      .returning();

    return created ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const deleted = await this.database
      .delete(appVersionTable)
      .where(eq(appVersionTable.id, id))
      .returning();

    return deleted.length > 0;
  }

  override async save(record: AppVersionDbRecord): Promise<AppVersionDbRecord> {
    const { id, ...data } = record;

    const [updated] = await this.database
      .update(appVersionTable)
      .set(data)
      .where(eq(appVersionTable.id, id))
      .returning();

    if (!updated) {
      throw new Error(`App version with id ${id} not found`);
    }

    return updated;
  }
}
