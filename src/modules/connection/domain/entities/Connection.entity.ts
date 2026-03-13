import { Password } from '@/modules/users/domain/value-objects';
import {
  ConnectionUUID,
  DeviceUUID,
  IpAddress,
  UserId,
} from '@/shared/value-objects';

import { ConnectionCode, ConnectionStatus } from '../value-objects/';

export class Connection {
  constructor(
    readonly ConnectionUuid: ConnectionUUID,
    readonly guestId: UserId | null,
    readonly hostId: UserId | null,
    readonly guestDeviceId: DeviceUUID,
    readonly hostDeviceId: DeviceUUID,
    readonly code: ConnectionCode,
    readonly guestIp: IpAddress,
    readonly hostIp: IpAddress,
    readonly status: ConnectionStatus,
    readonly password: Password,
    readonly startedAt: Date,
    readonly endedAt: Date,
  ) {}
  private copy(changes: Partial<Connection>): Connection {
    return new Connection(
      changes.ConnectionUuid ?? this.ConnectionUuid,
      changes.guestId ?? this.guestId,
      changes.hostId ?? this.hostId,
      changes.guestDeviceId ?? this.guestDeviceId,
      changes.hostDeviceId ?? this.hostDeviceId,
      changes.code ?? this.code,
      changes.guestIp ?? this.guestIp,
      changes.hostIp ?? this.hostIp,
      changes.status ?? this.status,
      changes.password ?? this.password,
      changes.startedAt ?? this.startedAt,
      changes.endedAt ?? this.endedAt,
    );
  }
  async comparePassword(password: string): Promise<boolean> {
    return this.password.verify(password);
  }

  updateStatus(status: ConnectionStatus): Connection {
    return this.copy({ status });
  }
}
