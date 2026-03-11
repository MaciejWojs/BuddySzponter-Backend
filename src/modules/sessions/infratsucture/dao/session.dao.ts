import { BaseDao } from '@infra/db/base.dao';
import { connectionSessionsTable } from '@infra/db/schema';
import { and, eq, or } from 'drizzle-orm';

import { CreateSession, ISessionDAO, SessionDbRecord } from './ISessionDao';

export class DrizzleSessionDao
  extends BaseDao<SessionDbRecord, CreateSession>
  implements ISessionDAO
{
  constructor() {
    super();
  }
  override async findById(id: number): Promise<SessionDbRecord | null> {
    const session = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.id, id))
      .limit(1);

    return session[0] ?? null;
  }

  async findByGuestId(userId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.guestId, userId));

    return sessions;
  }

  async findByHostId(userId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.hostId, userId));

    return sessions;
  }

  async findByStatus(status: string): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.status, status));

    return sessions;
  }

  async findActiveByUserId(userId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(
        and(
          eq(connectionSessionsTable.status, 'active'),
          or(
            eq(connectionSessionsTable.guestId, userId),
            eq(connectionSessionsTable.hostId, userId),
          ),
        ),
      );

    return sessions;
  }

  async findByGuestDeviceId(deviceId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.guestDeviceId, deviceId));

    return sessions;
  }

  async findByHostDeviceId(deviceId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.hostDeviceId, deviceId));

    return sessions;
  }

  override async create(data: CreateSession): Promise<SessionDbRecord | null> {
    const [newSession] = await this.database
      .insert(connectionSessionsTable)
      .values(data)
      .returning();
    return newSession ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(connectionSessionsTable)
      .where(eq(connectionSessionsTable.id, id))
      .returning();

    return result.length > 0;
  }

  override async save(record: SessionDbRecord): Promise<SessionDbRecord> {
    const { id, ...data } = record;
    const [updated] = await this.database
      .update(connectionSessionsTable)
      .set(data)
      .where(eq(connectionSessionsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Session with id ${id} not found`);
    return updated;
  }
}
