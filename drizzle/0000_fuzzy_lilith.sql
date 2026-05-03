CREATE TYPE "public"."virat-crm_file_entity_type" AS ENUM('sale', 'replacement');--> statement-breakpoint
CREATE TYPE "public"."virat-crm_leave_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."virat-crm_leave_type" AS ENUM('Sick', 'Vacation', 'Unpaid');--> statement-breakpoint
CREATE TYPE "public"."virat-crm_role" AS ENUM('Admin', 'Manager', 'Employee');--> statement-breakpoint
CREATE TABLE "virat-crm_branch" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"radius_meters" integer DEFAULT 50 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "virat-crm_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "virat-crm_file_entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"key" varchar(512) NOT NULL,
	"original_name" varchar(256) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_leave" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"type" "virat-crm_leave_type" NOT NULL,
	"status" "virat-crm_leave_status" DEFAULT 'Pending' NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "virat-crm_location_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"slab" varchar(20) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"frequency_map" jsonb NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "virat-crm_product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "virat-crm_replacement" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_sale_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "virat-crm_sale_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virat-crm_sale" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"invoice_date" timestamp with time zone DEFAULT now() NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"transaction_number" varchar(100),
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"user_id" uuid NOT NULL,
	"manager_id" uuid,
	"pincode" varchar(20),
	"address_line_1" varchar(256),
	"landmark" varchar(256),
	"area" varchar(256),
	"city" varchar(100),
	"state" varchar(100),
	"delivery_address" text,
	"customer_name" varchar(256),
	"customer_address" text,
	"main_qty" integer DEFAULT 0 NOT NULL,
	"free_qty" integer DEFAULT 0 NOT NULL,
	"total_qty" integer DEFAULT 0 NOT NULL,
	"invoice_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"advance_payment_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"received_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "virat-crm_sale_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "virat-crm_sale_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
CREATE TABLE "virat-crm_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kinde_id" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"employee_code" varchar(256),
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"role" "virat-crm_role" DEFAULT 'Employee' NOT NULL,
	"branch_id" integer,
	"manager_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "virat-crm_user_kinde_id_unique" UNIQUE("kinde_id"),
	CONSTRAINT "virat-crm_user_email_unique" UNIQUE("email"),
	CONSTRAINT "virat-crm_user_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
ALTER TABLE "virat-crm_file" ADD CONSTRAINT "virat-crm_file_uploaded_by_virat-crm_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_leave" ADD CONSTRAINT "virat-crm_leave_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_location_logs" ADD CONSTRAINT "virat-crm_location_logs_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_notification" ADD CONSTRAINT "virat-crm_notification_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" ADD CONSTRAINT "virat-crm_replacement_original_sale_id_virat-crm_sale_id_fk" FOREIGN KEY ("original_sale_id") REFERENCES "public"."virat-crm_sale"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_replacement" ADD CONSTRAINT "virat-crm_replacement_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale_item" ADD CONSTRAINT "virat-crm_sale_item_sale_id_virat-crm_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."virat-crm_sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale_item" ADD CONSTRAINT "virat-crm_sale_item_product_id_virat-crm_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."virat-crm_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale" ADD CONSTRAINT "virat-crm_sale_manager_id_virat-crm_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD CONSTRAINT "virat-crm_user_branch_id_virat-crm_branch_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."virat-crm_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_user" ADD CONSTRAINT "virat-crm_user_manager_id_virat-crm_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_date_slab_uidx" ON "virat-crm_location_logs" USING btree ("user_id","date","slab");--> statement-breakpoint
CREATE INDEX "recorded_at_idx" ON "virat-crm_location_logs" USING btree ("recorded_at");