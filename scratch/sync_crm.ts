import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../src/env";
import { sql } from "drizzle-orm";

async function main() {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  console.log("Syncing CRM database...");

  try {
    // 1. Create the customer status enum
    await db.execute(
      sql.raw(
        `CREATE TYPE "virat-crm_customer_status" AS ENUM ('Draft', 'Approved')`,
      ),
    );
    console.log("Customer status enum created.");
  } catch (e) {
    console.log("Customer status enum might already exist.");
  }

  try {
    // 2. Create the customer table
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "virat-crm_customer" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(256) NOT NULL,
        "mobile" varchar(20) NOT NULL UNIQUE,
        "dob" timestamp with time zone,
        "pincode" varchar(10) NOT NULL,
        "village" varchar(256) NOT NULL,
        "district" varchar(256) NOT NULL,
        "state" varchar(256) NOT NULL,
        "address" varchar(1024) NOT NULL,
        "branch_id" integer NOT NULL REFERENCES "virat-crm_branch"("id"),
        "status" "virat-crm_customer_status" NOT NULL DEFAULT 'Draft',
        "created_by" uuid NOT NULL REFERENCES "virat-crm_user"("id"),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now()
      )
    `),
    );
    console.log("Customer table created.");
  } catch (e) {
    console.error("Error creating customer table:", e);
  }

  try {
    // 3. Update sales table with customer_id
    await db.execute(
      sql.raw(
        `ALTER TABLE "virat-crm_sale" ADD COLUMN IF NOT EXISTS "customer_id" uuid REFERENCES "virat-crm_customer"("id")`,
      ),
    );
    console.log("Sales table updated with customer_id.");
  } catch (e) {
    console.error("Error updating sales table:", e);
  }

  await client.end();
}

main().catch(console.error);
