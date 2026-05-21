import { db } from "./index";
import { users } from "./schema/users";
import { isNull } from "drizzle-orm";

async function fixUsers() {
  console.log("Fixing users without employee codes...");
  const usersToFix = await db
    .select()
    .from(users)
    .where(isNull(users.employeeCode));

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

// Helper eq import
import { eq } from "drizzle-orm";

fixUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
