import { Device } from '@/modules/devices/domain/entities/Device.entity';
import {
  DeviceFingerprint,
  DeviceName,
  DeviceOS
} from '@/modules/devices/domain/value-objects';
import { DeviceUUID, UserId } from '@/shared/value-objects';

export interface DeviceInputData {
  userId?: number;
  deviceId: string;
  fingerprint?: string;
  name: string;
  os?: string;
}

export function mapToDeviceInput(data: DeviceInputData): Device {
  const fingerprint = data.fingerprint?.trim() || data.deviceId;

  return new Device(
    new DeviceUUID(data.deviceId),
    data.userId ? new UserId(data.userId) : null,
    new DeviceFingerprint(fingerprint),
    new DeviceName(data.name),
    new DeviceOS(data.os ?? 'Unknown OS'),
    new Date()
  );
}
