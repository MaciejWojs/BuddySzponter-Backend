import { DeviceUUID, IpAddress, UserId } from '@/shared/value-objects';

import { AuthSessionRefreshToken, AuthSessionUUID } from '../value-objects';

export class AuthSession {
  constructor(
    readonly id: AuthSessionUUID,
    readonly userId: UserId,
    readonly deviceId: DeviceUUID,
    readonly ipAddress: IpAddress,
    readonly refreshToken: AuthSessionRefreshToken,
    readonly userAgent: string,
    readonly revoked: boolean,
    readonly createdAt: Date,
    readonly expiresAt: Date,
  ) {}
  private copy(changes: Partial<AuthSession>): AuthSession {
    return new AuthSession(
      changes.id ?? this.id,
      changes.userId ?? this.userId,
      changes.deviceId ?? this.deviceId,
      changes.ipAddress ?? this.ipAddress,
      changes.refreshToken ?? this.refreshToken,
      changes.userAgent ?? this.userAgent,
      changes.revoked ?? this.revoked,
      changes.createdAt ?? this.createdAt,
      changes.expiresAt ?? this.expiresAt,
    );
  }
  revoke(): AuthSession {
    return this.copy({ revoked: true });
  }

  async rotateRefreshToken(): Promise<{ token: AuthSession; raw: string }> {
    const newToken = await AuthSessionRefreshToken.create({
      sessionId: this.id.value,
      userId: this.userId.value,
    });
    return {
      token: this.copy({ refreshToken: newToken.hashed }),
      raw: newToken.raw,
    };
  }
}
