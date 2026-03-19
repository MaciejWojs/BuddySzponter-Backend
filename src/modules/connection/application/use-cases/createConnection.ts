import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { Password } from '@/modules/users/domain/value-objects';
import { ConnectionUUID } from '@/shared/value-objects';

import { IpAddress } from '../../../../shared/value-objects/IpAddress.vo';
import { Connection } from '../../domain/entities/Connection.entity';
import { ConnectionParticipant } from '../../domain/entities/ConnectionParticipant.entity';
import { IConnectionRepository } from '../../domain/repositories/IConnectionRepository';
import { ConnectionCode, ConnectionStatus } from '../../domain/value-objects';

export interface CreateConnectionCommand {
  password: string;
  ipAddress: IpAddress;
  device: Device;
}

export class CreateConnection {
  constructor(private readonly repo: IConnectionRepository) {}
  static MAX_RETRIES = 5;
  async execute(input: CreateConnectionCommand): Promise<Connection> {
    const password = await Password.create(input.password);

    const hostParticipant = new ConnectionParticipant(
      input.device.userId,
      input.device.id,
      input.ipAddress,
      input.device.fingerprint,
    );

    let retries = CreateConnection.MAX_RETRIES;

    while (retries-- > 0) {
      const connection = new Connection(
        new ConnectionUUID(),
        hostParticipant,
        null,
        new ConnectionCode(),
        password,
        null,
        ConnectionStatus.PENDING,
      );

      try {
        return await this.repo.createPendingConnection(connection);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Connection code already exists')
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Failed to create connection after max retries');
  }
}
