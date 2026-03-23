ALTER TABLE "app_version" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "app_version" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "app_version" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "app_version" ALTER COLUMN "langHash" SET NOT NULL;