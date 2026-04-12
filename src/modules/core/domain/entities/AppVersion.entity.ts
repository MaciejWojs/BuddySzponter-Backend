import { AppVersionUUID } from '../value-objects/appVersionUUID.vo';
import { Version } from '../value-objects/version.vo';

export class AppVersion {
  constructor(
    public readonly id: AppVersionUUID,
    public readonly version: Version,
    public readonly codename: string | null,
    public readonly isSupported: boolean,
    public readonly langHash: string
  ) {}
}
