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
    );
  }
  async comparePassword(password: string): Promise<boolean> {
    return this.password.verify(password);
  }

  updateStatus(status: ConnectionStatus): Connection {
    return this.copy({ status });
  }

  joinConnection(guest: ConnectionParticipant): Connection {
    return this.copy({
      guest,
      status: ConnectionStatus.ACTIVE,
      startedAt: new Date(),
    });
  }
  updateCode(newCode: ConnectionCode = new ConnectionCode()): Connection {
    return this.copy({ code: newCode });
  }
}
