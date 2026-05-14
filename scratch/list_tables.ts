import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../src/env";
import { sql } from "drizzle-orm";

async function main() {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  const tables = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'virat-crm_%'
  `);

  console.log("Tables found:");
  tables.forEach(t => console.log(`- ${t.table_name}`));

  await client.end();
}

main().catch(console.error);
