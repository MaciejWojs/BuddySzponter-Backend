import { DeviceUUID, IpAddress, UserId } from '@/shared/value-objects';

import { AuthSession } from '../../domain/entities/AuthSession.entity';
import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import {
  AuthSessionRefreshToken,
  AuthSessionUUID,
} from '../../domain/value-objects';

export interface CreateAuthSessionCommand {
  userId: UserId;
  deviceId: DeviceUUID;
  ipAddress: IpAddress;
  refreshToken: AuthSessionRefreshToken;
  userAgent: string;
}

export class CreateAuthSession {
  constructor(protected readonly repo: IAuthSessionRepository) {}

  async execute(command: CreateAuthSessionCommand): Promise<AuthSession> {
    //TODO: Check if user has too many active sessions [5] and revoke oldest if needed
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = new AuthSession(
      new AuthSessionUUID(),
      command.userId,
      command.deviceId,
      command.ipAddress,
      command.refreshToken,
      command.userAgent,
      false,
      new Date(),
      expiresAt,
    );

    return await this.repo.createSession(session);
  }
}
