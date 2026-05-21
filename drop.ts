import { db } from "./src/server/db/index";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`DROP TABLE IF EXISTS "virat-crm_location_logs" CASCADE`);
  console.log("dropped");
  process.exit(0);
}

main();
