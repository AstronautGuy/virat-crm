import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../src/env";
import { rolePermissions } from "../src/server/db/schema/rolePermissions";
import { eq, and } from "drizzle-orm";

async function main() {
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client);

  const roles = ["Admin", "Manager", "Employee"] as const;
  const featureKey = "crm";

  console.log(`Enabling ${featureKey} for all roles...`);

  for (const role of roles) {
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, role),
          eq(rolePermissions.featureKey, featureKey)
        )
      );

    if (existing.length === 0) {
      await db.insert(rolePermissions).values({
        role,
        featureKey,
        isEnabled: true,
      });
      console.log(`Added permission for ${role}`);
    } else {
      await db
        .update(rolePermissions)
        .set({ isEnabled: true })
        .where(
          and(
            eq(rolePermissions.role, role),
            eq(rolePermissions.featureKey, featureKey)
          )
        );
      console.log(`Updated permission for ${role}`);
    }
  }

  console.log("Done.");
  await client.end();
  process.exit(0);
}

main().catch(console.error);
