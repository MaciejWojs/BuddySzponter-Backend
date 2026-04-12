import { DeviceFingerprint } from '@modules/devices/domain/value-objects/DeviceFingerprint.vo';

import { DeviceUUID, IpAddress, UserId } from '@/shared/value-objects';

export class ConnectionParticipant {
  constructor(
    readonly userId: UserId | null,
    readonly deviceId: DeviceUUID | null,
    readonly ipAddress: IpAddress,
    readonly fingerprint: DeviceFingerprint
  ) {}
}
