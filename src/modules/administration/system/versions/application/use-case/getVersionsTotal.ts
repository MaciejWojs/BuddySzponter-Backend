import { ICoreDao } from '@/modules/core/infrastructure/dao/ICoreDao';

export class GetVersionsTotal {
  constructor(private readonly coreDao: ICoreDao) {}

  async execute(): Promise<number> {
    return this.coreDao.countAll();
  }
}
