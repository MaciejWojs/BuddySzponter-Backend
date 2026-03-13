import { BaseCacheDao } from '@infra/cache/baseCache.dao';

import { DeviceDbRecord } from '@/shared/types';

import { IDevicesDAO } from '../dao/IDevicesDao';

export class DeviceCacheDao
  extends BaseCacheDao<DeviceDbRecord>
  implements IDevicesDAO
{
  static TTL = 60;
  constructor() {
    super();
  }

  override async findById(id: number): Promise<DeviceDbRecord | null> {
    const key = `device:${id}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  async findByUserId(userId: number): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:user:${userId}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }
  async findByFingerprint(fingerprint: string): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:fingerprint:${fingerprint}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }

  async findByName(name: string): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:name:${name}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }

  async findByDeviceType(deviceType: string): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:deviceType:${deviceType}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }

  async findByOs(os: string): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:os:${os}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }

  async findByBrowser(browser: string): Promise<DeviceDbRecord[]> {
    const pattern = `device:*:browser:${browser}`;
    const keys = await this.client.keys(pattern);
    const devices: DeviceDbRecord[] = [];
    for (const key of keys) {
      const data = await this.client.get(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    }
    return devices;
  }
  override async create(record: DeviceDbRecord): Promise<DeviceDbRecord> {
    const key = `device:${record.id}`;
    const result = await this.client.setex(
      key,
      DeviceCacheDao.TTL,
      JSON.stringify(record),
    );
    if (result !== 'OK') {
      throw new Error('Failed to create cache record');
    }
    return record;
  }
  override async deleteById(id: number): Promise<boolean> {
    const key = `device:${id}`;
    const result = await this.client.del(key);
    return result > 0;
  }
  override async save(record: DeviceDbRecord): Promise<DeviceDbRecord> {
    const key = `device:${record.id}`;
    const result = await this.client.setex(
      key,
      DeviceCacheDao.TTL,
      JSON.stringify(record),
    );
    if (result !== 'OK') {
      throw new Error('Failed to save cache record');
    }
    return record;
  }
}
