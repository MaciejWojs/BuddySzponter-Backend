import { AuthSession } from '@/modules/auth/domain/entities/AuthSession.entity';
import { User } from '@/modules/users/domain/entities/User.entity';

export type AuthSessionWithRawToken = {
  session: AuthSession;
  rawToken: string;
  user: User;
};
