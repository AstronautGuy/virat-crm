ALTER TABLE "virat-crm_user" ALTER COLUMN "kinde_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ALTER COLUMN "employee_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "password" varchar(256);