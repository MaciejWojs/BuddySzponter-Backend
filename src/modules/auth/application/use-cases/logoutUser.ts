import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '../../domain/value-objects';

export class LogoutUser {
  constructor(private readonly repo: IAuthSessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    const sessionUUID = new AuthSessionUUID(sessionId);

    const session = await this.repo.findSessionById(sessionUUID);
    if (!session) {
      // If the session doesn't exist, we can consider the user already logged out
      return;
    }

    const revokedSession = session.revoke();
    const saveSucceeded = await this.repo.save(revokedSession);
    if (!saveSucceeded) {
      throw new Error('Failed to persist revoked session');
    }
  }
}
