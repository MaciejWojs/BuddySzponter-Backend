import { IAuthSessionRepository } from '@/modules/auth/domain/repositories/IAuthSessionRepository';

import { GetSessionsQuery } from '../../api/schemas/sessions.request.schema';
import { SessionResponse } from '../../api/schemas/sessions.response.schema';

export class GetSessions {
  constructor(private readonly authSessionRepository: IAuthSessionRepository) {}

  async execute(query: GetSessionsQuery): Promise<SessionResponse[]> {
    const sessions = query.activeOnly
      ? await this.authSessionRepository.findAllActiveSessions()
      : await this.authSessionRepository.findAllSessions();

    return sessions.map((session) => ({
      id: session.id.value,
      userId: session.userId.value,
      deviceId: session.deviceId.value,
      ipAddress: session.ipAddress.value,
      userAgent: session.userAgent,
      revoked: session.revoked,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }
}
