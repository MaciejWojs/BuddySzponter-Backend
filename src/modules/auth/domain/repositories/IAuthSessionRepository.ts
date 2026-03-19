import { UserId } from '@/shared/value-objects';

import { AuthSession } from '../entities/AuthSession.entity';
import { AuthSessionUUID } from '../value-objects';
export interface IAuthSessionRepository {
  createSession(authSession: AuthSession): Promise<AuthSession>;
  findSessionById(id: AuthSessionUUID): Promise<AuthSession | null>;
  deleteSession(id: AuthSessionUUID): Promise<boolean>;
  save(authSession: AuthSession): Promise<boolean>;

  findAllSessionsByUserId(userId: UserId): Promise<AuthSession[]>;
  findAllSessionsByDeviceId(deviceId: string): Promise<AuthSession[]>;
  findAllSessionsByUserIdAndDeviceId(
    userId: UserId,
    deviceId: string,
  ): Promise<AuthSession[]>;

  findAllActiveSessionsByUserId(userId: UserId): Promise<AuthSession[]>;
}
