ALTER TABLE "virat-crm_user" ADD COLUMN "phone" varchar(32);--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "sms_notifications" boolean DEFAULT true NOT NULL;