ALTER TABLE "app_version" ADD COLUMN "langHash" varchar(255);--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD COLUMN "tokenVersion" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar(255);--> statement-breakpoint
ALTER TABLE "devices" DROP COLUMN "deviceType";--> statement-breakpoint
ALTER TABLE "devices" DROP COLUMN "browser";