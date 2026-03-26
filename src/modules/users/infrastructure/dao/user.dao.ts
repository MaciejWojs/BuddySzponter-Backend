import { BaseDao } from '@infra/db/base.dao';
import { rolesTable, usersTable } from '@infra/db/schema';
import { and, desc, eq, getColumns, ilike, or } from 'drizzle-orm';

import { UserDbRecord } from '@/shared/types';
import type { UserDbRecordWithRole } from '@/shared/types/UserDB';

import { CreateUser, FindUsersFilters, IUserDAO } from './IUserDAO';

export class DrizzleUserDao
  extends BaseDao<UserDbRecord, CreateUser, number>
  implements IUserDAO
{
  constructor() {
    super();
  }
  override async findById(id: number): Promise<UserDbRecordWithRole | null> {
    const user = await this.database
      .select({
        ...getColumns(usersTable),
        roleName: rolesTable.name,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.id, id))
      .limit(1);

    return user[0] ?? null;
  }

  async findMany(
    offset: number,
    limit: number,
  ): Promise<UserDbRecordWithRole[]> {
    return this.database
      .select({
        ...getColumns(usersTable),
        roleName: rolesTable.name,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findManyFiltered(
    filters: FindUsersFilters,
  ): Promise<UserDbRecordWithRole[]> {
    const { offset, limit, search, role, isBanned, isDeleted } = filters;

    const whereParts = [
      typeof isBanned === 'boolean'
        ? eq(usersTable.isBanned, isBanned)
        : undefined,
      typeof isDeleted === 'boolean'
        ? eq(usersTable.isDeleted, isDeleted)
        : undefined,
      role ? ilike(rolesTable.name, role) : undefined,
      search
        ? or(
            ilike(usersTable.email, `%${search}%`),
            ilike(usersTable.nickname, `%${search}%`),
          )
        : undefined,
    ].filter(Boolean);

    return this.database
      .select({
        ...getColumns(usersTable),
        roleName: rolesTable.name,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(whereParts.length ? and(...whereParts) : undefined)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  override async create(
    data: CreateUser,
  ): Promise<UserDbRecordWithRole | null> {
    const { roleName: role, ...insertData } = data;
    const roleName = role.toUpperCase();

    const [insertedUser] = await this.database
      .insert(usersTable)
      .values(insertData)
      .returning();

    if (!insertedUser) {
      return null;
    }

    return {
      ...insertedUser,
      roleName,
    };
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    return result.length > 0;
  }
  async findByEmail(email: string): Promise<UserDbRecordWithRole | null> {
    const user = await this.database
      .select({
        ...getColumns(usersTable),
        roleName: rolesTable.name,
      })
      .from(usersTable)
      .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.email, email))
      .limit(1);

    return user[0] ?? null;
  }
  async deleteByEmail(email: string): Promise<boolean> {
    const result = await this.database
      .delete(usersTable)
      .where(eq(usersTable.email, email))
      .returning();

    return result.length > 0;
  }
  override async save(user: UserDbRecord): Promise<UserDbRecord> {
    const { id, ...data } = user;

    const [updatedUser] = await this.database
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`Failed to update user with id ${id}`);
    }

    return updatedUser;
  }
}
