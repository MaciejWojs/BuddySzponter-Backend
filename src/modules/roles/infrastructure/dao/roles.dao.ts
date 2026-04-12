import { BaseDao } from '@infra/db/base.dao';
import { rolesTable } from '@infra/db/schema';
import { asc, eq } from 'drizzle-orm';

import { CreateRole, IRolesDAO, RoleDbRecord } from './IRolesDao';

export class DrizzleRoleDao
  extends BaseDao<RoleDbRecord, CreateRole, number>
  implements IRolesDAO
{
  constructor() {
    super();
  }

  override async create(data: CreateRole): Promise<RoleDbRecord | null> {
    const roleToInsert = { ...data, name: data.name.toUpperCase() };
    const [newRole] = await this.database
      .insert(rolesTable)
      .values(roleToInsert)
      .returning();
    return newRole ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(rolesTable)
      .where(eq(rolesTable.id, id))
      .returning();

    return result.length > 0;
  }

  override async findById(id: number): Promise<RoleDbRecord | null> {
    const role = await this.database
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, id))
      .limit(1);

    return role[0] ?? null;
  }

  async findByName(name: string): Promise<RoleDbRecord | null> {
    const search = name.toUpperCase();
    const role = await this.database
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.name, search))
      .limit(1);

    return role[0] ?? null;
  }

  async findMany(): Promise<RoleDbRecord[]> {
    return this.database.select().from(rolesTable).orderBy(asc(rolesTable.id));
  }

  override async save(role: RoleDbRecord): Promise<RoleDbRecord> {
    const { id, ...data } = role;
    const roleToSave = { ...data, name: data.name.toUpperCase() };
    const [updatedRole] = await this.database
      .update(rolesTable)
      .set(roleToSave)
      .where(eq(rolesTable.id, id))
      .returning();

    if (!updatedRole) throw new Error(`Role with id ${id} not found`);
    return updatedRole;
  }
}
