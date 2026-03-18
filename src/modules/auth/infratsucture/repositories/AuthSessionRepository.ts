import { AuthSessionMapper } from '@/shared/mappers/AuthSessionMapper';
import { UserId } from '@/shared/value-objects';

import { AuthSession } from '../../domain/entities/AuthSession.entity';
import { IAuthSessionRepository } from '../../domain/repositories/IAuthSessionRepository';
import { AuthSessionUUID } from '../../domain/value-objects';
import { IAuthSessionDao } from '../dao/IAuthSessionDao';

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
    return sessionRecord ? AuthSessionMapper.toDomain(sessionRecord) : null;
  }

  async deleteSession(id: AuthSessionUUID): Promise<boolean> {
    return this.dao.deleteById(id.value);
  }

  async save(authSession: AuthSession): Promise<boolean> {
    await this.dao.save(AuthSessionMapper.toPersistence(authSession));
    return true;
  }

  async findAllSessionsByUserId(userId: UserId): Promise<AuthSession[]> {
    const sessionRecords = await this.dao.findAllByUserId(userId.value);
    return sessionRecords.map(AuthSessionMapper.toDomain);
  }

  async findAllSessionsByDeviceId(deviceId: string): Promise<AuthSession[]> {
    const sessionRecords = await this.dao.findAllByDeviceId(deviceId);
    return sessionRecords.map(AuthSessionMapper.toDomain);
  }

  async findAllSessionsByUserIdAndDeviceId(
    userId: UserId,
    deviceId: string,
  ): Promise<AuthSession[]> {
    const sessionRecords = await this.dao.findAllByUserIdAndDeviceId(
      userId.value,
      deviceId,
    );
    return sessionRecords.map(AuthSessionMapper.toDomain);
  }

  async findAllActiveSessionsByUserId(userId: UserId): Promise<AuthSession[]> {
    const sessionRecords = await this.dao.findAllActiveByUserId(userId.value);
    return sessionRecords.map(AuthSessionMapper.toDomain);
  }
}
