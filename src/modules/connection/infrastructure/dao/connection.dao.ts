import { BaseDao } from '@infra/db/base.dao';
import { connectionSessionsTable } from '@infra/db/schema';
import { eq } from 'drizzle-orm';

import {
  ConnectionDbRecord,
  CreateConnection,
  IConnectionDAO,
} from './IConnectionDao';

export class DrizzleConnectionDao
  extends BaseDao<ConnectionDbRecord, CreateConnection>
  implements IConnectionDAO
{
  constructor() {
    super();
  }
  override async findById(id: number): Promise<ConnectionDbRecord | null> {
    const Connection = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.id, id))
      .limit(1);

    return Connection[0] ?? null;
  }

  async findByGuestId(userId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.guestId, userId));

    return Connections;
  }

  async findByHostId(userId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.hostId, userId));

    return Connections;
  }

  async findByGuestDeviceId(deviceId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.guestDeviceId, deviceId));

    return Connections;
  }

  async findByHostDeviceId(deviceId: number): Promise<ConnectionDbRecord[]> {
    const Connections = await this.database
      .select()
      .from(connectionSessionsTable)
      .where(eq(connectionSessionsTable.hostDeviceId, deviceId));

    return Connections;
  }

  override async create(
    data: CreateConnection,
  ): Promise<ConnectionDbRecord | null> {
    const [newConnection] = await this.database
      .insert(connectionSessionsTable)
      .values(data)
      .returning();
    return newConnection ?? null;
  }

  override async deleteById(id: number): Promise<boolean> {
    const result = await this.database
      .delete(connectionSessionsTable)
      .where(eq(connectionSessionsTable.id, id))
      .returning();

    return result.length > 0;
  }

  override async save(record: ConnectionDbRecord): Promise<ConnectionDbRecord> {
    const { id, ...data } = record;
    const [updated] = await this.database
      .update(connectionSessionsTable)
      .set(data)
      .where(eq(connectionSessionsTable.id, id))
      .returning();
    if (!updated) throw new Error(`Connection with id ${id} not found`);
    return updated;
  }
}
