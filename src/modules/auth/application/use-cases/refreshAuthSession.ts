import { IUserRepository } from '@/modules/users/domain/repositories/IUserRepository';
import { AuthSessionWithRawToken } from '@/shared/types/AuthSessionWithRawToken';

import {
  AuthSessionRefreshToken,
  AuthSessionUUID
} from '../../domain/value-objects';
import { AuthSessionRepository } from '../../infratsucture/repositories/AuthSessionRepository';

export interface RefreshAuthSessionCommand {
  sessionId: string;
  refreshToken: string;
}

export class RefreshAuthSession {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: RefreshAuthSessionCommand
  ): Promise<AuthSessionWithRawToken> {
    const sessionId = new AuthSessionUUID(input.sessionId);
    const session = await this.authSessionRepository.findSessionById(sessionId);

    if (!session) {
      throw new Error('Invalid refresh token');
    }
    if (session.revoked) {
      throw new Error('Refresh token has been revoked');
    }

    const token = AuthSessionRefreshToken.fromHash(session.refreshToken.value);

    if (!token.verify(input.refreshToken)) {
      const revokedSession = session.revoke();
      await this.authSessionRepository.save(revokedSession);
      throw new Error('Invalid refresh token, session has been terminated');
    }

    const rotatedSession = await session.rotateRefreshToken();
    const isSaved = await this.authSessionRepository.save(rotatedSession.token);
    if (!isSaved) {
      throw new Error('Failed to rotate refresh token');
    }
    const newSession =
      await this.authSessionRepository.findSessionById(sessionId);

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new Error('User not found for the given session');
    }

    const finalData: AuthSessionWithRawToken = {
      session: newSession!,
      rawToken: rotatedSession.raw,
      user
    };
    return finalData;
  }
}
