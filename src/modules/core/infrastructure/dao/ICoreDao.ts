import { appVersionTable } from '@infra/db/schema';

export type AppVersionDbRecord = typeof appVersionTable.$inferSelect;
export type CreateAppVersion = typeof appVersionTable.$inferInsert;
export type FindVersionsFilters = {
  offset: number;
  limit: number;
  version?: string;
  codename?: string;
  isSupported?: boolean;
};

export interface ICoreDao {
  findById(id: string): Promise<AppVersionDbRecord | null>;
  findByVersion(version: string): Promise<AppVersionDbRecord | null>;
  countAll(): Promise<number>;
  findMany(offset: number, limit: number): Promise<AppVersionDbRecord[]>;
  findManyFiltered(filters: FindVersionsFilters): Promise<AppVersionDbRecord[]>;
  findLangHashByVersion(version: string): Promise<string | null>;
  findSupportedVersions(): Promise<AppVersionDbRecord[]>;
  create(data: CreateAppVersion): Promise<AppVersionDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: AppVersionDbRecord): Promise<AppVersionDbRecord>;
  updateLangHashByVersion(version: string, langHash: string): Promise<boolean>;
}
