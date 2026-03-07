import { usersTable } from '@infra/db/schema';

export type UserDbRecord = typeof usersTable.$inferSelect;
