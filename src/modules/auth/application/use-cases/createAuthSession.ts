import { APP_CONFIG } from '@/config/appConfig';
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
    const existingSessionsWithDevice =
      await this.repo.findAllSessionsByUserIdAndDeviceId(
        command.userId,
        command.deviceId.value,
      );

    await Promise.all(
      existingSessionsWithDevice.map((session) => {
        const revokedSession = session.revoke();
        return this.repo.save(revokedSession);
      }),
    );

    const sessions = await this.repo.findAllActiveSessionsByUserId(
      command.userId,
    );

    if (sessions.length >= APP_CONFIG.auth.session.maxActivePerUser) {
      const oldestSession = sessions.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest,
      );
      const revokedOldestSession = oldestSession.revoke();
      await this.repo.save(revokedOldestSession);
    }

    const expiresAt = new Date(
      Date.now() + APP_CONFIG.auth.session.expiresInMs,
    );
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
