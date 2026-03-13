import { usersTable } from '@infra/db/schema';

export type UserDbRecord = typeof usersTable.$inferSelect;
export interface UserDbRecordWithRole extends UserDbRecord {
  roleName: string;
}
