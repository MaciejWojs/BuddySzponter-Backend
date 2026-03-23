import { AppVersion } from '../entities/AppVersion.entity';
import { AppVersionUUID } from '../value-objects/appVersionUUID.vo';
import { Version } from '../value-objects/version.vo';

export interface ICoreRepository {
  getSupportedVersions(): Promise<AppVersion[]>;
  createVersion(version: AppVersion): Promise<AppVersion>;
  findByVersion(version: Version): Promise<AppVersion | null>;
  findById(id: AppVersionUUID): Promise<AppVersion | null>;
  getLangHashByVersion(version: string): Promise<string | null>;
}
