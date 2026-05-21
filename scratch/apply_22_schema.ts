import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../src/env";
import { sql } from "drizzle-orm";

async function main() {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  console.log("Manually applying Phase 22 schema changes...");

  try {
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS "virat-crm_daily_report" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "virat-crm_user"("id"),
        "branch_id" integer NOT NULL REFERENCES "virat-crm_branch"("id"),
        "report_date" timestamp with time zone DEFAULT now() NOT NULL,
        "content" text NOT NULL,
        "customer_id" uuid REFERENCES "virat-crm_customer"("id"),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone
      )
    `),
    );
    console.log("Table 'virat-crm_daily_report' created successfully.");
  } catch (e) {
    console.error("Error creating table:", e);
  }

  await client.end();
}

main().catch(console.error);
