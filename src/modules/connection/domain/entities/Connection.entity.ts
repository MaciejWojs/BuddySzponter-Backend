import { ConnectionId, DeviceId, UserId } from '@/shared/value-objects';

import { ConnectionStatus } from '../value-objects/';

export class Connection {
  constructor(
    readonly id: ConnectionId,
    readonly guestId: UserId,
    readonly hostId: UserId,
    readonly guestDeviceId: DeviceId,
    readonly hostDeviceId: DeviceId,
    readonly status: ConnectionStatus,
    readonly createdAt: Date,
    readonly expiresAt: Date,
  ) {}
  private copy(changes: Partial<Connection>): Connection {
    return new Connection(
      changes.id ?? this.id,
      changes.guestId ?? this.guestId,
      changes.hostId ?? this.hostId,
      changes.guestDeviceId ?? this.guestDeviceId,
      changes.hostDeviceId ?? this.hostDeviceId,
      changes.status ?? this.status,
      changes.createdAt ?? this.createdAt,
      changes.expiresAt ?? this.expiresAt,
    );
  }
  updateStatus(status: ConnectionStatus): Connection {
    return this.copy({ status });
  }
}
