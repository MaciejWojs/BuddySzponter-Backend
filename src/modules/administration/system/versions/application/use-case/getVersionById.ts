import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

import { VersionResponse } from '../../api/schemas/versions.response.schema';

export class GetVersionById {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(id: string): Promise<VersionResponse> {
    const row = await this.coreDao.findById(id);

    if (!row) {
      throw new Error('App version not found');
    }

    return {
      id: row.id,
      version: row.version,
      codename: row.codename,
      isSupported: row.isSupported,
      langHash: row.langHash,
    };
  }
}
