import { AppVersionMapper } from '@/shared/mappers/appVersionMapper';

import { AppVersion } from '../../domain/entities/AppVersion.entity';
import { ICoreRepository } from '../../domain/repositories/ICoreRepository';
import { AppVersionUUID } from '../../domain/value-objects/appVersionUUID.vo';
import { Version } from '../../domain/value-objects/version.vo';
import { ICoreDao } from '../dao/ICoreDao';

export class CoreRepository implements ICoreRepository {
  constructor(private readonly dao: ICoreDao) {}

  async findByVersion(version: Version): Promise<AppVersion | null> {
    const result = await this.dao.findByVersion(version.value);
    if (!result) {
      return null;
    }
    return AppVersionMapper.toDomain(result);
  }
  async findById(id: AppVersionUUID): Promise<AppVersion | null> {
    const result = await this.dao.findById(id.value);
    if (!result) {
      return null;
    }
    return AppVersionMapper.toDomain(result);
  }

  async getSupportedVersions(): Promise<AppVersion[]> {
    const rows = await this.dao.findSupportedVersions();
    const final = rows.map(AppVersionMapper.toDomain);
    return final;
  }

  async updateLangHashByVersion(
    version: string,
    hash: string,
  ): Promise<boolean> {
    return this.dao.updateLangHashByVersion(version, hash);
  }

  async getLangHashByVersion(version: string): Promise<string | null> {
    return this.dao.findLangHashByVersion(version);
  }

  async createVersion(data: AppVersion): Promise<AppVersion> {
    const created = await this.dao.create({
      id: data.id.value,
      version: data.version.value,
      codename: data.codename,
      isSupported: data.isSupported,
      langHash: data.langHash,
    });

    if (!created) {
      throw new Error('Failed to create app version');
    }

    return AppVersionMapper.toDomain(created);
  }
}
