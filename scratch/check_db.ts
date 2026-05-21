import "dotenv/config";
import { db } from "../src/server/db";
import { users } from "../src/server/db/schema";

async function main() {
  console.log("Querying users...");
  try {
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users:`);
    for (const u of allUsers) {
      console.log(
        `- ${u.employeeCode} (${u.role}): email=${u.email}, active=${u.isActive}`,
      );
    }
  } catch (e) {
    console.error("DB Query error:", e);
  }
  process.exit(0);
}

main();
