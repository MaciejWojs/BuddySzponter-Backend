import { BaseDao } from '@infra/db/base.dao';
import { eq } from 'drizzle-orm';
import { authSessionsTable } from '@infra/db/schema';
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
      .from(authSessionsTable)
      .where(eq(authSessionsTable.id, id))
      .limit(1);

    return session[0] ?? null;
  }

  async findByUserId(userId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(authSessionsTable)
      .where(eq(authSessionsTable.userId, userId));

    return sessions;
  }

  async findByDeviceId(deviceId: number): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(authSessionsTable)
      .where(eq(authSessionsTable.deviceId, deviceId));

    return sessions;
  }

  async findByIpAddress(ipAddress: string): Promise<SessionDbRecord[]> {
    const sessions = await this.database
      .select()
      .from(authSessionsTable)
      .where(eq(authSessionsTable.ipAddress, ipAddress));

    return sessions;
  }

  override async create(data: CreateSession): Promise<SessionDbRecord | null> {
    const [newSession] = await this.database
      .insert(authSessionsTable)
      .values(data)
      .returning();
    return newSession ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.id, id))
      .returning();

    return result.length > 0;
  }

  override async save(session: SessionDbRecord): Promise<SessionDbRecord> {
    const { id, ...data } = session;
    const [updatedSession] = await this.database
      .update(authSessionsTable)
      .set(data)
      .where(eq(authSessionsTable.id, id))
      .returning();

    if (!updatedSession) throw new Error(`Session with id ${id} not found`);
    return updatedSession;
  }
}
