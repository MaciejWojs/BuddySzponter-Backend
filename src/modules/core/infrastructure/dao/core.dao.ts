import { BaseDao } from '@infra/db/base.dao';
import { appVersionTable } from '@infra/db/schema';
import { and, desc, eq, ilike, sql } from 'drizzle-orm';

import {
  AppVersionDbRecord,
  CreateAppVersion,
  FindVersionsFilters,
  ICoreDao,
} from './ICoreDao';

export class DrizzleCoreDao
  extends BaseDao<AppVersionDbRecord, CreateAppVersion>
  implements ICoreDao
{
  constructor() {
    super();
  }

  async countAll(): Promise<number> {
    const [row] = await this.database
      .select({ count: sql<number>`count(*)` })
      .from(appVersionTable);

    return Number(row?.count ?? 0);
  }

  async findMany(offset: number, limit: number): Promise<AppVersionDbRecord[]> {
    return this.database
      .select()
      .from(appVersionTable)
      .orderBy(desc(appVersionTable.version))
      .limit(limit)
      .offset(offset);
  }

  async findManyFiltered(
    filters: FindVersionsFilters,
  ): Promise<AppVersionDbRecord[]> {
    const { offset, limit, version, codename, isSupported } = filters;

    const whereParts = [
      version ? eq(appVersionTable.version, version) : undefined,
      codename ? ilike(appVersionTable.codename, `%${codename}%`) : undefined,
      typeof isSupported === 'boolean'
        ? eq(appVersionTable.isSupported, isSupported)
        : undefined,
    ].filter(Boolean);

    return this.database
      .select()
      .from(appVersionTable)
      .where(whereParts.length ? and(...whereParts) : undefined)
      .orderBy(desc(appVersionTable.version))
      .limit(limit)
      .offset(offset);
  }

  override async findById(id: string): Promise<AppVersionDbRecord | null> {
    const rows = await this.database
      .select()
      .from(appVersionTable)
      .where(eq(appVersionTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByVersion(version: string): Promise<AppVersionDbRecord | null> {
    const rows = await this.database
      .select()
      .from(appVersionTable)
      .where(eq(appVersionTable.version, version))
      .limit(1);

    return rows[0] ?? null;
  }

  async findLangHashByVersion(version: string): Promise<string | null> {
    const row = await this.findByVersion(version);
    return row?.langHash ?? null;
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

  override async deleteById(id: string): Promise<boolean> {
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

  async updateLangHashByVersion(
    version: string,
    langHash: string,
  ): Promise<boolean> {
    const updated = await this.database
      .update(appVersionTable)
      .set({ langHash })
      .where(eq(appVersionTable.version, version))
      .returning({ id: appVersionTable.id });

    return updated.length > 0;
  }
}
