import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

import { PatchVersionInput } from '../../api/schemas/versions.request.schema';

export class UpdateVersion {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(id: string, input: PatchVersionInput): Promise<void> {
    const existing = await this.coreDao.findById(id);
    if (!existing) {
      throw new Error('App version not found');
    }

    if (input.version && input.version !== existing.version) {
      const versionExists = await this.coreDao.findByVersion(input.version);
      if (versionExists && versionExists.id !== id) {
        throw new Error('App version already exists');
      }
    }

    await this.coreDao.save({
      ...existing,
      version: input.version ?? existing.version,
      codename:
        input.codename !== undefined ? input.codename : existing.codename,
      isSupported:
        typeof input.isSupported === 'boolean'
          ? input.isSupported
          : existing.isSupported
    });
  }
}
