import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '../../domain/value-objects';

export class LogoutUser {
  constructor(private readonly repo: IAuthSessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    const sessionUUID = new AuthSessionUUID(sessionId);

    const session = await this.repo.findSessionById(sessionUUID);
    if (!session) {
      throw new Error('Session not found');
    }

    const revokedSession = session.revoke();
    await this.repo.save(revokedSession);
  }
}
