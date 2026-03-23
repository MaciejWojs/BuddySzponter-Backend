import { appVersionTable } from '@infra/db/schema';

export type AppVersionDbRecord = typeof appVersionTable.$inferSelect;
export type CreateAppVersion = typeof appVersionTable.$inferInsert;

export interface ICoreDao {
  findById(id: string): Promise<AppVersionDbRecord | null>;
  findByVersion(version: string): Promise<AppVersionDbRecord | null>;
  findLangHashByVersion(version: string): Promise<string | null>;
  findSupportedVersions(): Promise<AppVersionDbRecord[]>;
  create(data: CreateAppVersion): Promise<AppVersionDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: AppVersionDbRecord): Promise<AppVersionDbRecord>;
  updateLangHashByVersion(version: string, langHash: string): Promise<boolean>;
}
