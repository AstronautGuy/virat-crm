CREATE TABLE "virat-crm_daily_report" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"branch_id" integer NOT NULL,
	"report_date" timestamp with time zone DEFAULT now() NOT NULL,
	"content" text NOT NULL,
	"customer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "virat-crm_daily_report" ADD CONSTRAINT "virat-crm_daily_report_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_daily_report" ADD CONSTRAINT "virat-crm_daily_report_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_daily_report" ADD CONSTRAINT "virat-crm_daily_report_customer_id_virat-crm_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."virat-crm_customer"("id") ON DELETE no action ON UPDATE no action;