import { randomBytes } from 'crypto';

import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

import { CreateVersionInput } from '../../api/schemas/versions.request.schema';

export class CreateVersion {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(input: CreateVersionInput): Promise<void> {
    const exists = await this.coreDao.findByVersion(input.version);
    if (exists) {
      throw new Error('App version already exists');
    }

    const created = await this.coreDao.create({
      version: input.version,
      codename: input.codename ?? null,
      isSupported: input.isSupported,
      langHash: randomBytes(16).toString('hex'),
    });

    if (!created) {
      throw new Error('Failed to create app version');
    }
  }
}
