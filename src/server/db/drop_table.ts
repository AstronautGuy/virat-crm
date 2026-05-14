import { db } from "./index";
import { sql } from "drizzle-orm";

async function drop() {
  console.log("Dropping table files...");
  await db.execute(sql`DROP TABLE IF EXISTS files CASCADE;`);
  console.log("Table dropped.");
  process.exit(0);
}

void drop();
