import { AppVersion } from '../entities/AppVersion.entity';

export interface ICoreRepository {
  getSupportedVersions(): Promise<AppVersion[]>;
  createVersion(data: {
    version: string;
    codename: string | null;
    isSupported: boolean;
  }): Promise<AppVersion>;
  hasVersion(version: string): Promise<boolean>;
  getLangHashByVersion(version: string): Promise<string | null>;
  updateLangHashByVersion(version: string, hash: string): Promise<boolean>;
}
