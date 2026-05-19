CREATE TYPE "public"."file_entity_type" AS ENUM('sale', 'replacement');--> statement-breakpoint
CREATE TABLE "virat-crm_roles" (
	"name" varchar(64) PRIMARY KEY NOT NULL,
	"description" varchar(256),
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_system_settings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"max_users" integer DEFAULT 50 NOT NULL,
	"is_system_locked" boolean DEFAULT false NOT NULL,
	"is_read_only" boolean DEFAULT false NOT NULL,
	"disabled_features_global" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "virat-crm_user" DROP CONSTRAINT "virat-crm_user_kinde_id_unique";--> statement-breakpoint
ALTER TABLE "virat-crm_breadcrumbs" DROP CONSTRAINT "virat-crm_breadcrumbs_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_customer" DROP CONSTRAINT "virat-crm_customer_created_by_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_daily_report" DROP CONSTRAINT "virat-crm_daily_report_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_file" DROP CONSTRAINT "virat-crm_file_uploaded_by_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_inventory_transaction" DROP CONSTRAINT "virat-crm_inventory_transaction_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_leave" DROP CONSTRAINT "virat-crm_leave_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_location_logs" DROP CONSTRAINT "virat-crm_location_logs_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_notification" DROP CONSTRAINT "virat-crm_notification_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_push_subscription" DROP CONSTRAINT "virat-crm_push_subscription_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" DROP CONSTRAINT "virat-crm_replacement_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_sale" DROP CONSTRAINT "virat-crm_sale_user_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_sale" DROP CONSTRAINT "virat-crm_sale_manager_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" DROP CONSTRAINT "virat-crm_stock_transfer_requested_by_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" DROP CONSTRAINT "virat-crm_stock_transfer_approved_by_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" DROP CONSTRAINT "virat-crm_stock_transfer_received_by_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_user" DROP CONSTRAINT "virat-crm_user_manager_id_virat-crm_user_id_fk";
--> statement-breakpoint
ALTER TABLE "virat-crm_file" ALTER COLUMN "entity_type" SET DATA TYPE file_entity_type;--> statement-breakpoint
ALTER TABLE "virat-crm_role_permission" ALTER COLUMN "role" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "virat-crm_user" ALTER COLUMN "role" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "last_active_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "last_lat" varchar(32);--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "last_lng" varchar(32);--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD COLUMN "connectivity_status" varchar(32);--> statement-breakpoint
ALTER TABLE "virat-crm_breadcrumbs" ADD CONSTRAINT "virat-crm_breadcrumbs_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD CONSTRAINT "virat-crm_customer_created_by_virat-crm_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_daily_report" ADD CONSTRAINT "virat-crm_daily_report_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_file" ADD CONSTRAINT "virat-crm_file_uploaded_by_virat-crm_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory_transaction" ADD CONSTRAINT "virat-crm_inventory_transaction_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_leave" ADD CONSTRAINT "virat-crm_leave_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_location_logs" ADD CONSTRAINT "virat-crm_location_logs_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_notification" ADD CONSTRAINT "virat-crm_notification_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_push_subscription" ADD CONSTRAINT "virat-crm_push_subscription_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" ADD CONSTRAINT "virat-crm_replacement_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_role_permission" ADD CONSTRAINT "virat-crm_role_permission_role_virat-crm_roles_name_fk" FOREIGN KEY ("role") REFERENCES "public"."virat-crm_roles"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_manager_id_virat-crm_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_requested_by_id_virat-crm_user_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_approved_by_id_virat-crm_user_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_received_by_id_virat-crm_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD CONSTRAINT "virat-crm_user_role_virat-crm_roles_name_fk" FOREIGN KEY ("role") REFERENCES "public"."virat-crm_roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD CONSTRAINT "virat-crm_user_manager_id_virat-crm_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "breadcrumbs_user_created_idx" ON "virat-crm_breadcrumbs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "sales_branch_created_idx" ON "virat-crm_sale" USING btree ("branch_id","created_at");--> statement-breakpoint
ALTER TABLE "virat-crm_user" DROP COLUMN "kinde_id";--> statement-breakpoint
DROP TYPE "public"."virat-crm_file_entity_type";--> statement-breakpoint
DROP TYPE "public"."virat-crm_role";