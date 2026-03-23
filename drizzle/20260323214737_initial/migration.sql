CREATE TABLE "app_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"version" varchar(50) NOT NULL UNIQUE,
	"codename" varchar(100),
	"isSupported" boolean DEFAULT true NOT NULL,
	"langHash" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" integer NOT NULL,
	"deviceId" uuid NOT NULL,
	"refreshTokenHash" varchar(255) NOT NULL UNIQUE,
	"ipAddress" inet NOT NULL,
	"userAgent" varchar(500) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connection_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"guestId" integer,
	"hostId" integer,
	"guestDeviceId" uuid,
	"hostDeviceId" uuid,
	"guestIpAddress" inet NOT NULL,
	"hostIpAddress" inet NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL,
	"connectionCode" varchar(10) NOT NULL,
	"connectionPasswordHash" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" integer,
	"fingerprint" varchar(255) NOT NULL,
	"name" varchar(255),
	"os" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUsedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL UNIQUE,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"roleId" integer NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"nickname" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"isBanned" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_deviceId_devices_id_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_guestId_users_id_fkey" FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_hostId_users_id_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_guestDeviceId_devices_id_fkey" FOREIGN KEY ("guestDeviceId") REFERENCES "devices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_hostDeviceId_devices_id_fkey" FOREIGN KEY ("hostDeviceId") REFERENCES "devices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_roles_id_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id");