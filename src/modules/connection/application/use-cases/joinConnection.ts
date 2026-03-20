import { Device } from '@/modules/devices/domain/entities/Device.entity';
import { IpAddress } from '@/shared/value-objects';

import { ConnectionParticipant } from '../../domain/entities/ConnectionParticipant.entity';
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
  async execute(input: JoinConnectionCommand) {
    const connection = await this.repo.findByCode(input.code);
    if (!connection) {
      throw new Error('Connection not found');
    }
    const doPasswordMatch = await connection.comparePassword(input.password);
    if (!doPasswordMatch) {
      throw new Error('Invalid password');
    }
    const guestParticipant = new ConnectionParticipant(
      input.device.userId,
      input.device.id,
      input.ipAddress,
      input.device.fingerprint,
    );
    const updatedConnection = connection.joinConnection(guestParticipant);
    return await this.repo.updateConnection(updatedConnection);
  }
}
