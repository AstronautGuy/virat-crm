CREATE TYPE "public"."virat-crm_customer_status" AS ENUM('Draft', 'Approved');--> statement-breakpoint
CREATE TABLE "virat-crm_customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"mobile" varchar(20) NOT NULL,
	"dob" timestamp with time zone,
	"pincode" varchar(10) NOT NULL,
	"village" varchar(256) NOT NULL,
	"district" varchar(256) NOT NULL,
	"state" varchar(256) NOT NULL,
	"address" varchar(1024) NOT NULL,
	"branch_id" integer NOT NULL,
	"status" "virat-crm_customer_status" DEFAULT 'Draft' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "virat-crm_customer_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
CREATE TABLE "virat-crm_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "virat-crm_inventory_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"reference_id" varchar(256),
	"reason" varchar(256),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_performance_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"entity_id" varchar(100),
	"period" varchar(7) NOT NULL,
	"metrics" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_replacements_archive" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"product_name" varchar(256) NOT NULL,
	"status" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"archived_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_sales_archive" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"order_date" timestamp with time zone NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_name" varchar(256),
	"invoice_amount" numeric(12, 2) NOT NULL,
	"total_qty" integer DEFAULT 0 NOT NULL,
	"details" jsonb NOT NULL,
	"archived_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_stock_transfer" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_branch_id" integer NOT NULL,
	"to_branch_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"requested_by_id" uuid NOT NULL,
	"approved_by_id" uuid,
	"received_by_id" uuid,
	"items" jsonb NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" ADD COLUMN "branch_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD CONSTRAINT "virat-crm_customer_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD CONSTRAINT "virat-crm_customer_created_by_virat-crm_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory" ADD CONSTRAINT "virat-crm_inventory_product_id_virat-crm_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."virat-crm_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory" ADD CONSTRAINT "virat-crm_inventory_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory_transaction" ADD CONSTRAINT "virat-crm_inventory_transaction_product_id_virat-crm_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."virat-crm_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory_transaction" ADD CONSTRAINT "virat-crm_inventory_transaction_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_inventory_transaction" ADD CONSTRAINT "virat-crm_inventory_transaction_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_from_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("from_branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_to_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("to_branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_requested_by_id_virat-crm_user_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_approved_by_id_virat-crm_user_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_stock_transfer" ADD CONSTRAINT "virat-crm_stock_transfer_received_by_id_virat-crm_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_branch_idx" ON "virat-crm_inventory" USING btree ("product_id","branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "perf_snapshot_entity_period_idx" ON "virat-crm_performance_snapshots" USING btree ("entity_type","entity_id","period");--> statement-breakpoint
CREATE INDEX "archive_repl_branch_idx" ON "virat-crm_replacements_archive" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "archive_repl_date_idx" ON "virat-crm_replacements_archive" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "archive_branch_idx" ON "virat-crm_sales_archive" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "archive_order_number_idx" ON "virat-crm_sales_archive" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "archive_date_idx" ON "virat-crm_sales_archive" USING btree ("archived_at");--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" ADD CONSTRAINT "virat-crm_replacement_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_customer_id_virat-crm_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."virat-crm_customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "breadcrumbs_created_at_idx" ON "virat-crm_breadcrumbs" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "virat-crm_product" DROP COLUMN "stock";