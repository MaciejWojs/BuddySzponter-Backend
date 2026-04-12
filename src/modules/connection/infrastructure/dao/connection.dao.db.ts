import { BaseDao } from '@infra/db/base.dao';
import { connectionLogsTable } from '@infra/db/schema';
import { eq } from 'drizzle-orm';

import {
  ConnectionDbRecord,
  CreateConnection,
  IConnectionDAO
} from './IConnectionDao.db';

export class DrizzleConnectionDao
  extends BaseDao<ConnectionDbRecord, CreateConnection>
  implements IConnectionDAO
{
  constructor() {
    super();
  }

  override async create(
    data: CreateConnection
  ): Promise<ConnectionDbRecord | null> {
    const [newConnection] = await this.database
      .insert(connectionLogsTable)
      .values(data)
      .returning();
    return newConnection ?? null;
  }

  override async deleteById(id: string): Promise<boolean> {
    const result = await this.database
      .delete(connectionLogsTable)
      .where(eq(connectionLogsTable.id, id))
      .returning();

    return result.length > 0;
  }

  async findByGuestDeviceId(deviceId: string): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionLogsTable)
      .where(eq(connectionLogsTable.guestDeviceId, deviceId));

    return Connections;
  }

  async findByGuestId(userId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionLogsTable)
      .where(eq(connectionLogsTable.guestId, userId));

    return Connections;
  }

  async findByHostDeviceId(deviceId: string): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionLogsTable)
      .where(eq(connectionLogsTable.hostDeviceId, deviceId));

    return Connections;
  }

  async findByHostId(userId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionLogsTable)
      .where(eq(connectionLogsTable.hostId, userId));

    return Connections;
  }

  override async findById(id: string): Promise<ConnectionDbRecord | null> {
    const Connection = await this.database
      .select()
      .from(connectionLogsTable)
      .where(eq(connectionLogsTable.id, id))
      .limit(1);

    return Connection[0] ?? null;
  }

  override async save(record: ConnectionDbRecord): Promise<ConnectionDbRecord> {
    const { id, ...data } = record;
    const [updated] = await this.database
      .update(connectionLogsTable)
      .set(data)
      .where(eq(connectionLogsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Connection with id ${id} not found`);
    return updated;
  }
}
