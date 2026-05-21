import { db } from "../src/server/db";
import { users, sales, replacements } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Verifying User Deletion Cascade...");

  // Find EMP001
  const employee = await db.query.users.findFirst({
    where: eq(users.employeeCode, "EMP001"),
  });

  if (!employee) {
    console.error("Employee EMP001 not found!");
    process.exit(1);
  }

  console.log(`Found Employee EMP001 with ID: ${employee.id}`);

  // Check sales and replacements before deletion
  const salesBefore = await db.query.sales.findMany({
    where: eq(sales.userId, employee.id),
  });
  const replacementsBefore = await db.query.replacements.findMany({
    where: eq(replacements.userId, employee.id),
  });

  console.log(
    `Before deletion: Sales: ${salesBefore.length}, Replacements: ${replacementsBefore.length}`,
  );

  if (salesBefore.length === 0 || replacementsBefore.length === 0) {
    console.error(
      "Employee must have at least one sale and one replacement for cascade verification!",
    );
    process.exit(1);
  }

  // Perform deletion
  console.log(`Deleting user ${employee.id}...`);
  await db.delete(users).where(eq(users.id, employee.id));
  console.log("User deleted successfully!");

  // Verify cascades
  const salesAfter = await db.query.sales.findMany({
    where: eq(sales.userId, employee.id),
  });
  const replacementsAfter = await db.query.replacements.findMany({
    where: eq(replacements.userId, employee.id),
  });

  console.log(
    `After deletion: Sales: ${salesAfter.length}, Replacements: ${replacementsAfter.length}`,
  );

  if (salesAfter.length === 0 && replacementsAfter.length === 0) {
    console.log(
      "SUCCESS: User and all cascaded sales and replacements deleted perfectly!",
    );
    process.exit(0);
  } else {
    console.error(
      "FAILURE: Cascade deletion did not remove all child records!",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
