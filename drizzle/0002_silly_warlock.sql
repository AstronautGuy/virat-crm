CREATE TABLE "virat-crm_role_permission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "virat-crm_role" NOT NULL,
	"feature_key" varchar(256) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone
);
