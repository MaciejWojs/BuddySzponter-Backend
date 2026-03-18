import { and, eq, gt, lt } from 'drizzle-orm';

import { BaseDao } from '@/infrastucture/db/base.dao';
import * as schema from '@/infrastucture/db/schema';

import {
  AuthSessionDbRecord,
  CreateAuthSession,
  IAuthSessionDao,
} from './IAuthSessionDao';

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

  async findAllByUserId(userId: number): Promise<AuthSessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(schema.authSessionsTable)
      .where(eq(schema.authSessionsTable.userId, userId));

    return sessions;
  }

  async findAllByDeviceId(deviceId: string): Promise<AuthSessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(schema.authSessionsTable)
      .where(eq(schema.authSessionsTable.deviceId, deviceId));

    return sessions;
  }
  async findAllByUserIdAndDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<AuthSessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(schema.authSessionsTable)
      .where(
        and(
          eq(schema.authSessionsTable.userId, userId),
          eq(schema.authSessionsTable.deviceId, deviceId),
        ),
      );
    return sessions;
  }

  async findAllActiveByUserId(userId: number): Promise<AuthSessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(schema.authSessionsTable)
      .where(
        and(
          eq(schema.authSessionsTable.userId, userId),
          eq(schema.authSessionsTable.revoked, false),
          gt(schema.authSessionsTable.expiresAt, new Date()),
        ),
      );
    return sessions;
  }

  async deleteRevokedSessionsByUserId(userId: number): Promise<number> {
    const deleteResult = await this.database
      .delete(schema.authSessionsTable)
      .where(
        and(
          eq(schema.authSessionsTable.userId, userId),
          eq(schema.authSessionsTable.revoked, true),
        ),
      );

    return deleteResult;
  }
  async deleteExpiredSessionsByUserId(userId: number): Promise<number> {
    const deleteResult = await this.database
      .delete(schema.authSessionsTable)
      .where(
        and(
          eq(schema.authSessionsTable.userId, userId),
          lt(schema.authSessionsTable.expiresAt, new Date()),
        ),
      );

    return deleteResult;
  }
}
