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

  async updateLangHashByVersion(
    version: string,
    hash: string,
  ): Promise<boolean> {
    return this.dao.updateLangHashByVersion(version, hash);
  }

  async hasVersion(version: string): Promise<boolean> {
    const row = await this.dao.findByVersion(version);
    return !!row;
  }

  async getLangHashByVersion(version: string): Promise<string | null> {
    return this.dao.findLangHashByVersion(version);
  }

  async createVersion(data: {
    version: string;
    codename: string | null;
    isSupported: boolean;
  }): Promise<AppVersion> {
    const created = await this.dao.create({
      version: data.version,
      codename: data.codename,
      isSupported: data.isSupported,
    });

    if (!created) {
      throw new Error('Failed to create app version');
    }

    return new AppVersion(
      created.id,
      created.version,
      created.codename ?? null,
      created.isSupported,
    );
  }
}
