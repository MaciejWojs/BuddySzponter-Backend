import { IAuthSessionRepository } from '@/modules/auth/domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '@/modules/auth/domain/value-objects';

export class TerminateSession {
  constructor(private readonly authSessionRepository: IAuthSessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    const sessionUUID = new AuthSessionUUID(sessionId);
    const session =
      await this.authSessionRepository.findSessionById(sessionUUID);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.revoked) {
      return;
    }

    const saveSucceeded = await this.authSessionRepository.save(
      session.revoke(),
    );
    if (!saveSucceeded) {
      throw new Error('Failed to persist revoked session');
    }
  }
}
