import { IAuthSessionRepository } from '@/modules/auth/domain/repositories/IAuthSessionRepository';
import { UserId } from '@/shared/value-objects';

import { GetUserSessionResponse } from '../../api/schemas/user.response.schema';

export class GetUserSessions {
  constructor(private readonly authSessionRepository: IAuthSessionRepository) {}

  async execute(userId: number): Promise<GetUserSessionResponse[]> {
    const sessions = await this.authSessionRepository.findAllSessionsByUserId(
      new UserId(userId)
    );

    return sessions.map((session) => ({
      id: session.id.value,
      userId,
      deviceId: session.deviceId.value,
      ipAddress: session.ipAddress.value,
      userAgent: session.userAgent,
      revoked: session.revoked,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    }));
  }
}
