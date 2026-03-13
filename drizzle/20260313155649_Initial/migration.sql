CREATE TABLE "app_version" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_version_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" varchar(50) NOT NULL UNIQUE,
	"codename" varchar(100),
	"isSupported" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auth_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"deviceId" integer NOT NULL,
	"refreshTokenHash" varchar(255) NOT NULL,
	"ipAddress" inet NOT NULL,
	"userAgent" varchar(500) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connection_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "connection_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"guestId" integer NOT NULL,
	"hostId" integer NOT NULL,
	"guestDeviceId" integer NOT NULL,
	"hostDeviceId" integer NOT NULL,
	"guestIpAddress" inet NOT NULL,
	"hostIpAddress" inet NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL,
	"connectionCode" varchar(10) NOT NULL,
	"connectionPasswordHash" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "devices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"fingerprint" varchar(255) NOT NULL,
	"name" varchar(255),
	"deviceType" varchar(50) NOT NULL,
	"os" varchar(100),
	"browser" varchar(100),
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
	"isBanned" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_deviceId_devices_id_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id");--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_guestId_users_id_fkey" FOREIGN KEY ("guestId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_hostId_users_id_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_guestDeviceId_devices_id_fkey" FOREIGN KEY ("guestDeviceId") REFERENCES "devices"("id");--> statement-breakpoint
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_hostDeviceId_devices_id_fkey" FOREIGN KEY ("hostDeviceId") REFERENCES "devices"("id");--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_roles_id_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id");

INSERT INTO "roles" ("name", "description") VALUES
('USER', 'Regular user with standard permissions'),
('ADMIN', 'Administrator with elevated permissions');