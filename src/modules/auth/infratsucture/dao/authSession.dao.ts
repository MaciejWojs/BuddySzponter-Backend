import { BaseDao } from '@/infrastucture/db/base.dao';

import {
  AuthSessionDbRecord,
  CreateAuthSession,
  IAuthSessionDao,
} from './IAuthSessionDao';
import * as schema from '@/infrastucture/db/schema';
import { eq } from 'drizzle-orm';

export class DrizzleAuthSessionDAO
  extends BaseDao<AuthSessionDbRecord, CreateAuthSession>
  implements IAuthSessionDao
{
  constructor() {
    super();
  }

  override async findById(id: string): Promise<AuthSessionDbRecord | null> {
    const authSessions = await this.database
      .select()
      .from(schema.authSessionsTable)
      .where(eq(schema.authSessionsTable.id, id))
      .limit(1);

    if (authSessions.length === 0) {
      return null;
    }

    return authSessions[0] ?? null;
  }

  override async create(
    data: CreateAuthSession,
  ): Promise<AuthSessionDbRecord | null> {
    const [createdSession] = await this.database
      .insert(schema.authSessionsTable)
      .values(data)
      .returning();

    return createdSession ?? null;
  }
  override async deleteById(id: string): Promise<boolean> {
    const deleteResult = await this.database
      .delete(schema.authSessionsTable)
      .where(eq(schema.authSessionsTable.id, id));

    return deleteResult > 0;
  }
  override async save(
    record: AuthSessionDbRecord,
  ): Promise<AuthSessionDbRecord> {
    const [updatedSession] = await this.database
      .update(schema.authSessionsTable)
      .set(record)
      .where(eq(schema.authSessionsTable.id, record.id))
      .returning();

    if (!updatedSession) {
      throw new Error(`Failed to update AuthSession with id ${record.id}`);
    }
    return updatedSession;
  }
}
