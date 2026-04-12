import { IRolesDAO } from '@/modules/roles/infrastructure/dao/IRolesDao';

export class DeleteRole {
  constructor(private readonly roleDao: IRolesDAO) {}

  async execute(roleId: number): Promise<void> {
    const deleted = await this.roleDao.deleteById(roleId);
    if (!deleted) {
      throw new Error('Role not found');
    }
  }
}
