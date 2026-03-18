import { DeviceUUID, UserId } from '@/shared/value-objects';
import { Device } from '../../domain/entities/Device.entity';
import { IDevicesRepository } from '../../domain/repositories/IDeviceRepository';
import {
  DeviceFingerprint,
} from '../../domain/value-objects';
import { IDevicesDAO } from '../dao/IDevicesDao';
import { DeviceMapper } from '@/shared/mappers/DeviceMapper';

export class DeviceRepository implements IDevicesRepository {
  constructor(protected readonly dao: IDevicesDAO) {}

  async findById(id: DeviceUUID): Promise<Device | null> {
    const deviceRecord = await this.dao.findById(id.value);
    return deviceRecord ? DeviceMapper.toDomain(deviceRecord) : null;
  }
  async create(device: Device): Promise<Device> {
    const createdDevice = await this.dao.create(
      DeviceMapper.toPersistence(device),
    );
    if (!createdDevice) {
      throw new Error('Failed to create device');
    }
    return DeviceMapper.toDomain(createdDevice);
  }
  async deleteById(id: DeviceUUID): Promise<boolean> {
    const result = await this.dao.deleteById(id.value);
    return result;
  }
  async save(device: Device): Promise<Device> {
    const updatedDevice = await this.dao.save(
      DeviceMapper.toPersistence(device),
    );
    return DeviceMapper.toDomain(updatedDevice);
  }
  async findByFingerprint(fingerprint: DeviceFingerprint): Promise<Device[]> {
    const deviceRecords = await this.dao.findByFingerprint(fingerprint.value);
    return deviceRecords.map(DeviceMapper.toDomain);
  }
  async findByUserId(userId: UserId): Promise<Device[]> {
    const deviceRecords = await this.dao.findByUserId(userId.value);
    return deviceRecords.map(DeviceMapper.toDomain);
  }
}
