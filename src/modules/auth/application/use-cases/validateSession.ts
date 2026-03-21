import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '../../domain/value-objects';

export class ValidateSession {
  constructor(private readonly repo: IAuthSessionRepository) {}

  async execute(sessionId: string): Promise<boolean> {
    const sesId = new AuthSessionUUID(sessionId);
    const session = await this.repo.findSessionById(sesId);
    if (!session) {
      return false;
    }
    if (session.expiresAt < new Date()) {
      const revokeSession = session.revoke();
      await this.repo.save(revokeSession);
      return false;
    }
    if (session.revoked) {
      return false;
    }

    return true;
  }
}
