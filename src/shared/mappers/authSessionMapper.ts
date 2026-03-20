import { AuthSession } from '@/modules/auth/domain/entities/AuthSession.entity';
import {
  AuthSessionRefreshToken,
  AuthSessionUUID,
} from '@/modules/auth/domain/value-objects';
import { AuthSessionDbRecord } from '@/modules/auth/infratsucture/dao/IAuthSessionDao';

import { DeviceUUID, IpAddress, UserId } from '../value-objects';

export class AuthSessionMapper {
  static toDomain(record: AuthSessionDbRecord): AuthSession {
    return new AuthSession(
      new AuthSessionUUID(record.id),
      new UserId(record.userId),
      new DeviceUUID(record.deviceId),
      new IpAddress(record.ipAddress),
      AuthSessionRefreshToken.fromHash(record.refreshTokenHash),
      record.userAgent,
      record.revoked,
      record.createdAt,
      record.expiresAt,
    );
  }

  static toPersistence(authSession: AuthSession): AuthSessionDbRecord {
    return {
      id: authSession.id.value,
      userId: authSession.userId.value,
      deviceId: authSession.deviceId.value,
      ipAddress: authSession.ipAddress.value,
      refreshTokenHash: authSession.refreshToken.value,
      userAgent: authSession.userAgent,
      revoked: authSession.revoked,
      createdAt: authSession.createdAt,
      expiresAt: authSession.expiresAt,
    };
  }
}
