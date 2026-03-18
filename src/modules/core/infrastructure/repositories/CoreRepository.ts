import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { ICoreRepository } from '../../domain/repositories/ICoreRepository';
import { ICoreDao } from '../dao/ICoreDao';

export class CoreRepository implements ICoreRepository {
  constructor(private readonly dao: ICoreDao) {}

  async getSupportedVersions(): Promise<AppVersion[]> {
    const rows = await this.dao.findSupportedVersions();

    return rows.map(
      (row) =>
        new AppVersion(
          row.id,
          row.version,
          row.codename ?? null,
          row.isSupported,
        ),
    );
  }
}
