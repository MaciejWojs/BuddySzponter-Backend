import { IRolesDAO } from '@/modules/roles/infrastructure/dao/IRolesDao';

import { RoleResponse } from '../../api/schemas/roles.response.schema';

export class GetRoles {
  constructor(private readonly roleDao: IRolesDAO) {}

  async execute(): Promise<RoleResponse[]> {
    const roles = await this.roleDao.findMany();

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? null,
    }));
  }
}
