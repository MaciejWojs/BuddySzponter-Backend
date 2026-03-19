import { AuthSession } from '@/modules/auth/domain/entities/AuthSession.entity';

export type AuthSessionWithRawToken = {
  session: AuthSession;
  rawToken: string;
};
