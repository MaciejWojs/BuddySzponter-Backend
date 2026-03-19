ALTER TABLE "app_version" ADD COLUMN "langHash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar(255);--> statement-breakpoint
ALTER TABLE "devices" DROP COLUMN "deviceType";--> statement-breakpoint
ALTER TABLE "devices" DROP COLUMN "browser";