import {
  boolean,
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

/*
ROLES
*/

export const rolesTable = pgTable('roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
});

/*
USERS
*/

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),

  nickname: varchar({ length: 100 }).notNull(),

  isBanned: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

/*
USER ROLES (many-to-many)
*/

export const userRolesTable = pgTable(
  'user_roles',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    roleId: integer()
      .notNull()
      .references(() => rolesTable.id, { onDelete: 'cascade' }),

    createdAt: timestamp().defaultNow().notNull(),
  },
  (t) => [unique('user_role_unique').on(t.userId, t.roleId)],
);

/*
DEVICES
*/

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
});

/*
AUTH SESSIONS
*/

export const authSessionsTable = pgTable('auth_sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  deviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'cascade' }),

  refreshTokenHash: varchar({ length: 255 }).notNull(),

  ipAddress: varchar({ length: 100 }).notNull(),

  userAgent: varchar({ length: 500 }).notNull(),

  revoked: boolean().default(false).notNull(),

  createdAt: timestamp().defaultNow().notNull(),

  expiresAt: timestamp().notNull(),
});

/*
CONNECTION SESSIONS
(np. WebRTC / remote session)
*/

export const connectionSessionsTable = pgTable('connection_sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  guestId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  hostId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  guestDeviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'cascade' }),

  hostDeviceId: integer()
    .notNull()
    .references(() => devicesTable.id, { onDelete: 'cascade' }),

  status: varchar({ length: 50 }).default('pending').notNull(),
  // pending | active | rejected | closed

  createdAt: timestamp().defaultNow().notNull(),

  expiresAt: timestamp().notNull(),
});
