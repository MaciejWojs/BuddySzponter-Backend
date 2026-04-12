import { IRolesDAO } from '@/modules/roles/infrastructure/dao/IRolesDao';

type UpdateRoleInput = {
  name?: string;
  description?: string | null;
};

export class UpdateRole {
  constructor(private readonly roleDao: IRolesDAO) {}

  async execute(roleId: number, input: UpdateRoleInput): Promise<void> {
    const existing = await this.roleDao.findById(roleId);
    if (!existing) {
      throw new Error('Role not found');
    }

    if (input.name && input.name.toUpperCase() !== existing.name) {
      const roleWithSameName = await this.roleDao.findByName(input.name);
      if (roleWithSameName && roleWithSameName.id !== roleId) {
        throw new Error('Role name already exists');
      }
    }

    await this.roleDao.save({
      ...existing,
      name: input.name ?? existing.name,
      description:
        input.description !== undefined
          ? input.description
          : existing.description
    });
  }
}
