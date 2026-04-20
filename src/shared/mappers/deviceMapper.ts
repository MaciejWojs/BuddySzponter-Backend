import { Device } from '@/modules/devices/domain/entities/Device.entity';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS
} from '@/modules/devices/domain/value-objects';
import { DeviceDbRecord } from '@/modules/devices/infrastructure/dao/IDevicesDao';

import { DeviceUUID, UserId } from '../value-objects';

export class DeviceMapper {
  static toDomain(deviceRecord: DeviceDbRecord): Device {
    return new Device(
      new DeviceUUID(deviceRecord.id),
      deviceRecord.userId !== null ? new UserId(deviceRecord.userId) : null,
      new DeviceFingerprint(deviceRecord.fingerprint),
      new DeviceName(deviceRecord.name ?? 'unknown'),
      new DeviceOS(deviceRecord.os ?? 'unknown'),
      deviceRecord.createdAt,
      deviceRecord.lastUsedAt,
      deviceRecord.lastIpAddress
    );
  }

  static toPersistence(device: Device): DeviceDbRecord {
    return {
      id: device.id.value,
      userId: device.userId?.value ?? null,
      fingerprint: device.fingerprint.value,
      name: device.name.value,
      os: device.os.value,
      lastIpAddress: device.lastIpAddress,
      createdAt: device.createdAt,
      lastUsedAt: device.lastUsedAt
    };
  }
}
