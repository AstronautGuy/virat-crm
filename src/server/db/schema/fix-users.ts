import "dotenv/config";
import { db } from "../index";
import { users } from "./users";
import { isNull, eq } from "drizzle-orm";

async function fixUsers() {
  console.log("Fixing users without employee codes...");
  // Select only columns that exist in the DB right now
  const usersToFix = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      employeeCode: users.employeeCode,
    })
    .from(users)
    .where(isNull(users.employeeCode));

  console.log(`Found ${usersToFix.length} users to fix.`);

  for (const user of usersToFix) {
    const mockCode = `EMP-${user.id.slice(0, 8)}`;
    console.log(
      `Setting ${user.firstName} ${user.lastName} code to ${mockCode}`,
    );
    await db
      .update(users)
      .set({ employeeCode: mockCode })
      .where(eq(users.id, user.id));
  }

  console.log("Done.");
  process.exit(0);
}

fixUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
