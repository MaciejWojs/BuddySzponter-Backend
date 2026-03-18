import { AuthSession } from '../entities/AuthSession.entity';
import { AuthSessionUUID } from '../value-objects';
export interface IAuthSessionRepository {
  createSession(authSession: AuthSession): Promise<AuthSession>;
  findSessionById(id: AuthSessionUUID): Promise<AuthSession | null>;
  deleteSession(id: AuthSessionUUID): Promise<boolean>;
  revokeSession(authSession: AuthSession): Promise<boolean>;
}
