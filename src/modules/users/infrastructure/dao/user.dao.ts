import { BaseDao } from '@infra/db/base.dao';
import { usersTable } from '@infra/db/schema';
import { eq } from 'drizzle-orm';

import { DrizzleRoleDao } from '@/modules/roles/infrastructure/dao/roles.dao';
import { UserDbRecord } from '@/shared/types';

import { CreateUser, IUserDAO } from './IUserDAO';

export class DrizzleUserDao
  extends BaseDao<UserDbRecord, CreateUser>
  implements IUserDAO
{
  constructor() {
    super();
  }
  override async findById(id: number): Promise<UserDbRecord | null> {
    const user = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return user[0] ?? null;
  }
  override async create(data: CreateUser): Promise<UserDbRecord | null> {
    const roleDao = new DrizzleRoleDao();
    const defaultRole = await roleDao.findByName('user');
    
    if (!defaultRole) {
      throw new Error('Default role "user" not found');
    }

    const crateUser = {
      ...data,
      roleId: defaultRole?.id,
    };

    const [newUser] = await this.database
      .insert(usersTable)
      .values(crateUser)
      .returning();
    return newUser ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();

    return result.length > 0;
  }
  async findByEmail(email: string): Promise<UserDbRecord | null> {
    const user = await this.database
      .select()
      .from(usersTable)
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
    const [updatedUser] = await this.database
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, user.id))
      .returning();

    if (!updatedUser) {
      throw new Error(`Failed to update user with id ${user.id}`);
    }

    return updatedUser;
  }
}
