import { Device } from '@/modules/devices/domain/entities/Device.entity';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS,
} from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';

export interface DeviceInputData {
  userId?: number;
  fingerprint: string;
  name: string;
  os?: string;
}

export function mapToDeviceInput(data: DeviceInputData): Device {
  return new Device(
    new DeviceUUID(),
    data.userId ? new UserId(data.userId) : null,
    new DeviceFingerprint(data.fingerprint),
    new DeviceName(data.name),
    new DeviceOS(data.os ?? 'Unknown OS'),
    new Date(),
  );
}
