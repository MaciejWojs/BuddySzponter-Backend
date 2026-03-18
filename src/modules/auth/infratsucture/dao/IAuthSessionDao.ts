import { z } from 'zod';

import { authSessionsTable } from '@infra/db/schema';

export type AuthSessionDbRecord = typeof authSessionsTable.$inferSelect;

export type CreateAuthSession = typeof authSessionsTable.$inferInsert;
export interface IAuthSessionDao {
  findById(id: string): Promise<AuthSessionDbRecord | null>;
  create(data: CreateAuthSession): Promise<AuthSessionDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: AuthSessionDbRecord): Promise<AuthSessionDbRecord>;
}
