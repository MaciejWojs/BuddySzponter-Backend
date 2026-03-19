import { Password } from '@/modules/users/domain/value-objects';
import { ConnectionUUID } from '@/shared/value-objects';

import { ConnectionCode, ConnectionStatus } from '../value-objects/';
import { ConnectionParticipant } from './ConnectionParticipant.entity';

export class Connection {
  constructor(
    readonly id: ConnectionUUID,
    readonly host: ConnectionParticipant,
    readonly guest: ConnectionParticipant | null,
    readonly code: ConnectionCode,
    readonly password: Password,
    readonly startedAt: Date | null,
    readonly status: ConnectionStatus = ConnectionStatus.INACTIVE,
    readonly joinAttempts: number = 0,
  ) {}
  private copy(changes: Partial<Connection>): Connection {
    return new Connection(
      changes.id ?? this.id,
      changes.host ?? this.host,
      changes.guest ?? this.guest,
      changes.code ?? this.code,
      changes.password ?? this.password,
      changes.startedAt ?? this.startedAt,
      changes.status ?? this.status,
      changes.joinAttempts ?? this.joinAttempts,
    );
  }
  async comparePassword(password: string): Promise<boolean> {
    return this.password.verify(password);
  }

  updateStatus(status: ConnectionStatus): Connection {
    return this.copy({ status });
  }

  joinConnection(guest: ConnectionParticipant): Connection {
    const updatedJoinAttempts = this.joinAttempts + 1;
    if (updatedJoinAttempts > 3) {
      throw new Error('Maximum join attempts exceeded');
    }
    if (this.guest) {
      throw new Error('Connection is already occupied by a guest');
    }
    //? Optional: Prevent host from joining as guest
    // if(this.host.userId?.value === guest.userId?.value) {
    //   throw new Error('Host cannot join their own connection as a guest');
    // }
    if (this.status !== ConnectionStatus.PENDING) {
      throw new Error('Connection is not joinable');
    }
    return this.copy({
      guest,
      status: ConnectionStatus.ACTIVE,
      startedAt: new Date(),
      joinAttempts: updatedJoinAttempts,
    });
  }
  updateCode(newCode: ConnectionCode = new ConnectionCode()): Connection {
    return this.copy({ code: newCode });
  }
}
