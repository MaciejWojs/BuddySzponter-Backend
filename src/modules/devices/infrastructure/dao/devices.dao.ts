import { BaseDao } from '@infra/db/base.dao';
import { devicesTable } from '@infra/db/schema';
import { eq } from 'drizzle-orm';

import { CreateDevice, DeviceDbRecord, IDevicesDAO } from './IDevicesDao';

export class DrizzleDevicesDao
  extends BaseDao<DeviceDbRecord, CreateDevice>
  implements IDevicesDAO
{
  constructor() {
    super();
  }
  override async findById(id: string): Promise<DeviceDbRecord | null> {
    const device = await this.database
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.id, id))
      .limit(1);

    return device[0] ?? null;
  }

  async findByUserId(userId: number): Promise<DeviceDbRecord[]> {
    const devices = await this.database
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.userId, userId));

    return devices;
  }

  async findByFingerprint(fingerprint: string): Promise<DeviceDbRecord[]> {
    const devices = await this.database
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.fingerprint, fingerprint));

    return devices;
  }

  async findByName(name: string): Promise<DeviceDbRecord[]> {
    const devices = await this.database
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.name, name));

    return devices;
  }

  async findByOs(os: string): Promise<DeviceDbRecord[]> {
    const devices = await this.database
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.os, os));

    return devices;
  }

  override async create(data: CreateDevice): Promise<DeviceDbRecord | null> {
    const [newDevice] = await this.database
      .insert(devicesTable)
      .values(data)
      .returning();
    return newDevice ?? null;
  }

  override async deleteById(id: string): Promise<boolean> {
    const result = await this.database
      .delete(devicesTable)
      .where(eq(devicesTable.id, id))
      .returning();

    return result.length > 0;
  }
  override async save(device: DeviceDbRecord): Promise<DeviceDbRecord> {
    const { id, ...data } = device;
    const [updatedDevice] = await this.database
      .update(devicesTable)
      .set(data)
      .where(eq(devicesTable.id, id))
      .returning();

    if (!updatedDevice) throw new Error(`Device with id ${id} not found`);
    return updatedDevice;
  }
}
