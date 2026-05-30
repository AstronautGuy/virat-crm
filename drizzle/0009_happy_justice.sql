CREATE TABLE "virat-crm_customer_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"arrival_time" timestamp with time zone DEFAULT now() NOT NULL,
	"departure_time" timestamp with time zone,
	"duration_minutes" integer
);
--> statement-breakpoint
CREATE TABLE "virat-crm_daily_mileage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"total_distance_meters" numeric(12, 2) DEFAULT '0' NOT NULL,
	"valid_points_count" integer DEFAULT 0 NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_mileage_user_date_uq" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "virat-crm_sale_assignment" (
	"sale_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	CONSTRAINT "virat-crm_sale_assignment_sale_id_user_id_role_pk" PRIMARY KEY("sale_id","user_id","role")
);
--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD COLUMN "geofence_polygon" jsonb;--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD COLUMN "latitude" numeric(10, 8);--> statement-breakpoint
ALTER TABLE "virat-crm_customer" ADD COLUMN "longitude" numeric(11, 8);--> statement-breakpoint
ALTER TABLE "virat-crm_location_logs" ADD COLUMN "location_name" varchar(255);--> statement-breakpoint
ALTER TABLE "virat-crm_product" ADD COLUMN "min_threshold" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "virat-crm_customer_visits" ADD CONSTRAINT "virat-crm_customer_visits_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_customer_visits" ADD CONSTRAINT "virat-crm_customer_visits_customer_id_virat-crm_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."virat-crm_customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_daily_mileage" ADD CONSTRAINT "virat-crm_daily_mileage_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale_assignment" ADD CONSTRAINT "virat-crm_sale_assignment_sale_id_virat-crm_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."virat-crm_sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virat-crm_sale_assignment" ADD CONSTRAINT "virat-crm_sale_assignment_user_id_virat-crm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."virat-crm_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_visits_user_idx" ON "virat-crm_customer_visits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customer_visits_customer_idx" ON "virat-crm_customer_visits" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_visits_date_idx" ON "virat-crm_customer_visits" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_mileage_date_idx" ON "virat-crm_daily_mileage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "customers_lat_lng_idx" ON "virat-crm_customer" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "customers_branch_idx" ON "virat-crm_customer" USING btree ("branch_id");