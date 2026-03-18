import { authSessionsTable } from '@infra/db/schema';

export type AuthSessionDbRecord = typeof authSessionsTable.$inferSelect;

export type CreateAuthSession = typeof authSessionsTable.$inferInsert;
export interface IAuthSessionDao {
  findById(id: string): Promise<AuthSessionDbRecord | null>;
  create(data: CreateAuthSession): Promise<AuthSessionDbRecord | null>;
  deleteById(id: string): Promise<boolean>;
  save(record: AuthSessionDbRecord): Promise<AuthSessionDbRecord>;

  findAllByUserId(userId: number): Promise<AuthSessionDbRecord[]>;
  findAllByDeviceId(deviceId: string): Promise<AuthSessionDbRecord[]>;
  findAllByUserIdAndDeviceId(
    userId: number,
    deviceId: string,
  ): Promise<AuthSessionDbRecord[]>;
  findAllActiveByUserId(userId: number): Promise<AuthSessionDbRecord[]>;

  deleteRevokedSessionsByUserId(userId: number): Promise<number>;
  deleteExpiredSessionsByUserId(userId: number): Promise<number>;
}
