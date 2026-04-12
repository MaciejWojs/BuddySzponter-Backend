import { IRolesDAO } from '@/modules/roles/infrastructure/dao/IRolesDao';

type CreateRoleInput = {
  name: string;
  description?: string | null;
};

export class CreateRole {
  constructor(private readonly roleDao: IRolesDAO) {}

  async execute(input: CreateRoleInput): Promise<{ id: number; name: string }> {
    const existingByName = await this.roleDao.findByName(input.name);
    if (existingByName) {
      throw new Error('Role name already exists');
    }

    const created = await this.roleDao.create({
      name: input.name,
      description: input.description ?? null,
    });

    if (!created) {
      throw new Error('Failed to create role');
    }

    return { id: created.id, name: created.name };
  }
}
