import {
  boolean,
  inet,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 255 }),
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer()
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'no action' }),

  email: varchar({ length: 255 }).notNull().unique(),
  nickname: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 255 }).notNull(),

  isBanned: boolean().default(false).notNull(),
  isDeleted: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const authSessionsTable = pgTable('auth_sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'no action' }),
  deviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'no action' }),

  refreshTokenHash: varchar({ length: 255 }).notNull(),

  ipAddress: inet().notNull(),
  userAgent: varchar({ length: 500 }).notNull(),

  revoked: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp().notNull(),
});

export const devicesTable = pgTable('devices', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  fingerprint: varchar({ length: 255 }).notNull(),

  name: varchar({ length: 255 }),

  deviceType: varchar({ length: 50 }).notNull(), // mobile / desktop / tablet
  os: varchar({ length: 100 }),
  browser: varchar({ length: 100 }),

  createdAt: timestamp().defaultNow().notNull(),
  lastUsedAt: timestamp(),
});

export const connectionSessionsTable = pgTable('connection_logs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  guestId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'no action' }),
  hostId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'no action' }),
  guestDeviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'no action' }),
  hostDeviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'no action' }),

  guestIpAddress: inet().notNull(),
  hostIpAddress: inet().notNull(),

  startedAt: timestamp().notNull(),
  endedAt: timestamp().notNull(),

  connectionCode: varchar({ length: 10 }).notNull(),
  connectionPasswordHash: varchar({ length: 255 }).notNull(),
});

export const appVersionTable = pgTable('app_version', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  version: varchar({ length: 50 }).notNull(),
  codename: varchar({ length: 100 }),
  isSupported: boolean().default(true).notNull(),
});
