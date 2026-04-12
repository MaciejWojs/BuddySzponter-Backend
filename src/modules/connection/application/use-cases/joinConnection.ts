import { APP_CONFIG } from '@/config/appConfig';
import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IpAddress } from '@/shared/value-objects';

import { Connection } from '../../domain/entities/Connection.entity';
import { ConnectionParticipant } from '../../domain/entities/ConnectionParticipant.entity';
import {
  ConnectionJoinAttemptsExceededError,
  ConnectionNotFoundError,
  InvalidConnectionPasswordError
} from '../../domain/error/ConnectionBusinessErrors';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { ConnectionCode } from '../../domain/value-objects';

export interface JoinConnectionCommand {
  code: ConnectionCode;
  password: string;
  device: Device;
  ipAddress: IpAddress;
}
export class JoinConnection {
  constructor(private readonly repo: IConnectionRepository) {}

  async execute(input: JoinConnectionCommand): Promise<Connection> {
    const connection = await this.repo.findByCode(input.code);
    if (!connection) {
      throw new ConnectionNotFoundError();
    }
    if (
      connection.joinAttempts >= APP_CONFIG.connection.retries.joinAttemptsLimit
    ) {
      await this.repo.deleteConnection(connection.id.value);
      throw new ConnectionJoinAttemptsExceededError();
    }
    const doPasswordMatch = await connection.comparePassword(input.password);
    if (!doPasswordMatch) {
      throw new InvalidConnectionPasswordError();
    }
    const guestParticipant = new ConnectionParticipant(
      input.device.userId,
      input.device.id,
      input.ipAddress,
      input.device.fingerprint
    );
    const updatedConnection = connection.joinConnection(guestParticipant);
    const didPersist = await this.repo.updateConnection(updatedConnection);
    if (!didPersist) {
      throw new Error('Failed to persist connection update');
    }

    return updatedConnection;
  }
}
