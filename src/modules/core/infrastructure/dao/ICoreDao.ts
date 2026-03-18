import { appVersionTable } from '@infra/db/schema';

export type AppVersionDbRecord = typeof appVersionTable.$inferSelect;
export type CreateAppVersion = typeof appVersionTable.$inferInsert;

export interface ICoreDao {
  findById(id: number): Promise<AppVersionDbRecord | null>;
  findSupportedVersions(): Promise<AppVersionDbRecord[]>;
  create(data: CreateAppVersion): Promise<AppVersionDbRecord | null>;
  deleteById(id: number): Promise<boolean>;
  save(record: AppVersionDbRecord): Promise<AppVersionDbRecord>;
}
