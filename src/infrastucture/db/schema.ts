import {
  boolean,
  inet,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 255 })
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  roleId: integer()
    .notNull()
    .references(() => rolesTable.id, { onDelete: 'no action' }),

  email: varchar({ length: 255 }).notNull().unique(),
  nickname: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }),

  isBanned: boolean().default(false).notNull(),
  isDeleted: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

export const authSessionsTable = pgTable('auth_sessions', {
  id: uuid().defaultRandom().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  deviceId: uuid()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'cascade' }),

  refreshTokenHash: varchar({ length: 255 }).notNull().unique(),

  ipAddress: inet().notNull(),
  userAgent: varchar({ length: 500 }).notNull(),

  revoked: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp().notNull()
});

export const devicesTable = pgTable('devices', {
  id: uuid().defaultRandom().primaryKey(),
  userId: integer().references(() => usersTable.id, { onDelete: 'cascade' }),

  fingerprint: varchar({ length: 255 }).notNull(),

  name: varchar({ length: 255 }),
  os: varchar({ length: 100 }),

  lastIpAddress: inet(),

  createdAt: timestamp().defaultNow().notNull(),
  lastUsedAt: timestamp()
});

export const connectionLogsTable = pgTable('connection_logs', {
  id: uuid().defaultRandom().primaryKey(),
  guestId: integer().references(() => usersTable.id, { onDelete: 'set null' }),
  hostId: integer().references(() => usersTable.id, { onDelete: 'set null' }),
  guestDeviceId: uuid().references(() => devicesTable.id, {
    onDelete: 'set null'
  }),
  hostDeviceId: uuid().references(() => devicesTable.id, {
    onDelete: 'set null'
  }),

  guestIpAddress: inet().notNull(),
  hostIpAddress: inet().notNull(),

  startedAt: timestamp().notNull(),
  endedAt: timestamp().notNull(),

  connectionCode: varchar({ length: 10 }).notNull(),
  connectionPasswordHash: varchar({ length: 255 }).notNull()
});

export const appVersionTable = pgTable('app_version', {
  id: uuid().defaultRandom().primaryKey(),
  version: varchar({ length: 50 }).notNull().unique(),
  codename: varchar({ length: 100 }),
  isSupported: boolean().default(true).notNull(),
  langHash: varchar({ length: 255 }).notNull()
});
