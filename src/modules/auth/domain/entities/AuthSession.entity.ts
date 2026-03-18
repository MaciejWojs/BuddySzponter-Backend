import { DeviceUUID, IpAddress, UserId } from '@/shared/value-objects';

import { AuthSessionRefreshTokenHash, AuthSessionUUID } from '../value-objects';

export class AuthSession {
  constructor(
    readonly id: AuthSessionUUID,
    readonly userId: UserId,
    readonly deviceId: DeviceUUID,
    readonly ipAddress: IpAddress,
    readonly refreshTokenHash: AuthSessionRefreshTokenHash,
    readonly userAgent: string,
    readonly revoked: boolean,
    readonly createdAt: Date,
    readonly expiresAt: Date,
    readonly tokenVersion: number,
  ) {}
  private copy(changes: Partial<AuthSession>): AuthSession {
    return new AuthSession(
      changes.id ?? this.id,
      changes.userId ?? this.userId,
      changes.deviceId ?? this.deviceId,
      changes.ipAddress ?? this.ipAddress,
      changes.refreshTokenHash ?? this.refreshTokenHash,
      changes.userAgent ?? this.userAgent,
      changes.revoked ?? this.revoked,
      changes.createdAt ?? this.createdAt,
      changes.expiresAt ?? this.expiresAt,
      changes.tokenVersion ?? this.tokenVersion,
    );
  }
  revoke(): AuthSession {
    return this.copy({ revoked: true });
  }
}
