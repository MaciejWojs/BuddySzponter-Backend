import { DeviceDbRecord } from '@/shared/types';

export interface IDeviceCacheDao {
  findById(id: number): Promise<DeviceDbRecord | null>;
  findByUserId(userId: number): Promise<DeviceDbRecord[]>;
  findByFingerprint(fingerprint: string): Promise<DeviceDbRecord[]>;
  findByName(name: string): Promise<DeviceDbRecord[]>;
  findByDeviceType(deviceType: string): Promise<DeviceDbRecord[]>;
  create(record: DeviceDbRecord): Promise<DeviceDbRecord>;
  deleteById(id: number): Promise<boolean>;
  save(record: DeviceDbRecord): Promise<DeviceDbRecord>;
}
