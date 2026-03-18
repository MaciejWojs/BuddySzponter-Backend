import { AuthSession } from '../../domain/entities/AuthSession.entity';
import { IAuthSessionDao } from '../dao/IAuthSessionDao';
import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '../../domain/value-objects';
import { AuthSessionMapper } from '@/shared/mappers/AuthSessionMapper';

export class AuthSessionRepository implements IAuthSessionRepository {
  constructor(protected readonly dao: IAuthSessionDao) {}
  async createSession(authSession: AuthSession): Promise<AuthSession> {
    const createdSession = await this.dao.create(
      AuthSessionMapper.toPersistence(authSession),
    );

    if (!createdSession) {
      throw new Error('Failed to create AuthSession');
    }

    return AuthSessionMapper.toDomain(createdSession);
  }

  async findSessionById(id: AuthSessionUUID): Promise<AuthSession | null> {
    const sessionRecord = await this.dao.findById(id.value);
    if (!sessionRecord) {
      return null;
    }

    return AuthSessionMapper.toDomain(sessionRecord);
  }

  async deleteSession(id: AuthSessionUUID): Promise<boolean> {
    const success = await this.dao.deleteById(id.value);
    if (!success) {
      throw new Error('Failed to delete AuthSession');
    }
    return true;
  }

  async revokeSession(authSession: AuthSession): Promise<boolean> {
    const session = authSession.revoke();
    const success = await this.dao.save(
      AuthSessionMapper.toPersistence(session),
    );
    if (!success) {
      throw new Error('Failed to revoke AuthSession');
    }
    return true;
  }
}
