import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping virat-crm_role enum cascade...");
  try {
    await db.execute(sql`DROP TYPE "virat-crm_role" CASCADE;`);
    console.log("Dropped successfully");
  } catch (e) {
    console.error("Error dropping type:", e);
  }
  process.exit(0);
}

void main();
