import { AppVersion } from '@/modules/core/domain/entities/AppVersion.entity';
import { Version } from '@/modules/core/domain/value-objects/version.vo';
import { AppVersionDbRecord } from '@/modules/core/infrastructure/dao/ICoreDao';

import { AppVersionUUID } from '../../modules/core/domain/value-objects/appVersionUUID.vo';

export class AppVersionMapper {
  static toDbRecord(domain: AppVersion): AppVersionDbRecord {
    return {
      id: domain.id.value,
      version: domain.version.value,
      codename: domain.codename,
      isSupported: domain.isSupported,
      langHash: domain.langHash
    };
  }

  static toDomain(record: AppVersionDbRecord): AppVersion {
    return new AppVersion(
      new AppVersionUUID(record.id),
      new Version(record.version),
      record.codename ?? null,
      record.isSupported,
      record.langHash ?? undefined
    );
  }
}
