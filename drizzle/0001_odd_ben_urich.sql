CREATE TABLE "virat-crm_breadcrumbs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"accuracy" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_push_subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "virat-crm_push_subscription_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "virat-crm_breadcrumbs" ADD CONSTRAINT "virat-crm_breadcrumbs_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_push_subscription" ADD CONSTRAINT "virat-crm_push_subscription_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leave_user_idx" ON "virat-crm_leave" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leave_status_idx" ON "virat-crm_leave" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leave_start_date_idx" ON "virat-crm_leave" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "branch_idx" ON "virat-crm_sale" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "virat-crm_sale" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "virat-crm_sale" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_idx" ON "virat-crm_sale" USING btree ("user_id");