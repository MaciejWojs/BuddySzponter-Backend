import { AppVersion } from '../entities/AppVersion.entity';

export interface ICoreRepository {
  getSupportedVersions(): Promise<AppVersion[]>;
}
