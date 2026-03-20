import { Connection } from '@/modules/connection/domain/entities/Connection.entity';
import { ConnectionParticipant } from '@/modules/connection/domain/entities/ConnectionParticipant.entity';
import {
  ConnectionCode,
  ConnectionStatus,
} from '@/modules/connection/domain/value-objects';
import { DeviceFingerprint } from '@/modules/devices/domain/value-objects';
import { Password } from '@/modules/users/domain/value-objects/Password.vo';
import {
  ConnectionUUID,
  DeviceUUID,
  IpAddress,
  UserId,
} from '@/shared/value-objects';

import { ConnectionPrimitive } from '../types/Connection';

export class ConnectionMapper {
  static toDomain(raw: ConnectionPrimitive): Connection {
    const host = new ConnectionParticipant(
      raw.hostId ? new UserId(raw.hostId) : null,
      raw.hostDeviceId ? new DeviceUUID(raw.hostDeviceId) : null,
      new IpAddress(raw.hostIpAddress),
      new DeviceFingerprint(raw.hostFingerprint),
    );

    const guest =
      raw.guestId &&
      raw.guestDeviceId &&
      raw.guestIpAddress &&
      raw.guestFingerprint
        ? new ConnectionParticipant(
            new UserId(raw.guestId),
            new DeviceUUID(raw.guestDeviceId),
            new IpAddress(raw.guestIpAddress),
            new DeviceFingerprint(raw.guestFingerprint),
          )
        : null;

    return new Connection(
      new ConnectionUUID(raw.connectionUUID),
      host,
      guest,
      new ConnectionCode(raw.code),
      Password.fromHash(raw.password),
      raw.startedAt ? new Date(raw.startedAt) : null,
      ConnectionStatus.fromString(raw.status),
      raw.joinAttempts ?? 0,
    );
  }
  // TODO TRY CATCH ON THROWABLE METHODS/CONSTRUCTORS
}
