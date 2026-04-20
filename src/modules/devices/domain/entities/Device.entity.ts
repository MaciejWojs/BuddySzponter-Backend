import { DeviceUUID, UserId } from '@/shared/value-objects';

import { DeviceFingerprint, DeviceName, DeviceOS } from '../value-objects';

export class Device {
  constructor(
    readonly id: DeviceUUID,
    readonly userId: UserId | null,
    readonly fingerprint: DeviceFingerprint,
    readonly name: DeviceName,
    readonly os: DeviceOS,
    readonly createdAt: Date,
    readonly lastUsedAt: Date | null = null,
    readonly lastIpAddress: string | null = null
  ) {}

  changeUser(userId: UserId): Device {
    if (!this.userId) {
      return this.copy({ userId });
    }
    throw new Error('Cannot change user for a device that is already assigned');
  }

  private copy(changes: Partial<Device>): Device {
    return new Device(
      changes.id ?? this.id,
      changes.userId ?? this.userId,
      changes.fingerprint ?? this.fingerprint,
      changes.name ?? this.name,
      changes.os ?? this.os,
      changes.createdAt ?? this.createdAt,
      changes.lastUsedAt ?? this.lastUsedAt,
      changes.lastIpAddress ?? this.lastIpAddress
    );
  }

  markAsUsed(at: Date = new Date()): Device {
    return this.copy({ lastUsedAt: at });
  }

  updateLastIpAddress(lastIpAddress: string): Device {
    return this.copy({ lastIpAddress });
  }

  updateName(name: DeviceName): Device {
    return this.copy({ name });
  }

  updateOs(os: DeviceOS): Device {
    return this.copy({ os });
  }

  updateUser(userId: UserId | null): Device {
    return this.copy({ userId });
  }
}
