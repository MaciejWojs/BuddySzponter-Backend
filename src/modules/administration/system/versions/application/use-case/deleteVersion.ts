import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

export class DeleteVersion {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.coreDao.deleteById(id);
    if (!deleted) {
      throw new Error('App version not found');
    }
  }
}
