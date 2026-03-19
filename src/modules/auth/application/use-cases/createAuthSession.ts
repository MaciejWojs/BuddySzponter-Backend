import { AuthSessionWithRawToken } from '@/shared/types/AuthSessionWithRawToken';
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
  userAgent: string;
}

export class CreateAuthSession {
  constructor(protected readonly repo: IAuthSessionRepository) {}

  async execute(
    command: CreateAuthSessionCommand,
  ): Promise<AuthSessionWithRawToken> {
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

    if (sessions.length >= 5) {
      const oldestSession = sessions.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest,
      );
      const revokedOldestSession = oldestSession.revoke();
      await this.repo.save(revokedOldestSession);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const { raw, hashed: refreshToken } = AuthSessionRefreshToken.create();
    const session = new AuthSession(
      new AuthSessionUUID(),
      command.userId,
      command.deviceId,
      command.ipAddress,
      refreshToken,
      command.userAgent,
      false,
      new Date(),
      expiresAt,
    );
    const createdSession = await this.repo.createSession(session);
    const finalData: AuthSessionWithRawToken = {
      session: createdSession,
      rawToken: raw,
    };
    return finalData;
  }
}
