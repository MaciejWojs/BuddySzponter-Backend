import { UserId } from 'src/modules/users/domain/value-objects';
import { DeviceId, IpAddress } from 'src/shared/value-objects';
import { AuthSessionId, AuthSessionRefreshTokenHash } from '../value-objects';

export class AuthSession {
  constructor(
    readonly id: AuthSessionId,
    readonly userId: UserId,
    readonly deviceId: DeviceId,
    readonly ipAddress: IpAddress,
    readonly refreshTokenHash: AuthSessionRefreshTokenHash,
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
      changes.refreshTokenHash ?? this.refreshTokenHash,
      changes.userAgent ?? this.userAgent,
      changes.revoked ?? this.revoked,
      changes.createdAt ?? this.createdAt,
      changes.expiresAt ?? this.expiresAt,
    );
  }
  revoke(): AuthSession {
    return this.copy({ revoked: true });
  }
}
