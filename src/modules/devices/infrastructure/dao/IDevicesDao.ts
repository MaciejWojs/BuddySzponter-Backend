import { devicesTable } from '@infra/db/schema';

export type DeviceDbRecord = typeof devicesTable.$inferSelect;

export type CreateDevice = Omit<DeviceDbRecord, 'id' | 'createdAt'>;

export interface IDevicesDAO {
  countAll(): Promise<number>;
  findMany(offset: number, limit: number): Promise<DeviceDbRecord[]>;
  findById(id: string): Promise<DeviceDbRecord | null>;
  findByUserId(userId: number): Promise<DeviceDbRecord[]>;
  findByFingerprint(fingerprint: string): Promise<DeviceDbRecord[]>;
  findByName(name: string): Promise<DeviceDbRecord[]>;
  findByOs(os: string): Promise<DeviceDbRecord[]>;
  create(data: CreateDevice): Promise<DeviceDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: DeviceDbRecord): Promise<DeviceDbRecord>;
}
