import { DeviceUUID, UserId } from '@/shared/value-objects';

import {
  DeviceBrowser,
  DeviceFingerprint,
  DeviceName,
  DeviceOS,
  DeviceType,
} from '../value-objects';

export class Device {
  constructor(
    readonly id: DeviceUUID,
    readonly userId: UserId,
    readonly fingerprint: DeviceFingerprint,
    readonly name: DeviceName,
    readonly type: DeviceType,
    readonly os: DeviceOS,
    readonly browser: DeviceBrowser,
    readonly createdAt: Date,
  ) {}
  private copy(changes: Partial<Device>): Device {
    return new Device(
      changes.id ?? this.id,
      changes.userId ?? this.userId,
      changes.fingerprint ?? this.fingerprint,
      changes.name ?? this.name,
      changes.type ?? this.type,
      changes.os ?? this.os,
      changes.browser ?? this.browser,
      changes.createdAt ?? this.createdAt,
    );
  }
  updateName(name: DeviceName): Device {
    return this.copy({ name });
  }
}
