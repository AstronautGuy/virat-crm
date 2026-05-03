import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/server/db/schema/users";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seedHierarchy() {
  console.log("🌱 Seeding extensive hierarchy...");

  // 1. Find the main admin (Devansh Rajan)
  const mainAdmin = await db.query.users.findFirst({
    where: eq(users.email, "devanshrajan2@gmail.com")
  });

  if (!mainAdmin) {
    console.error("❌ Main admin not found. Please login first.");
    return;
  }

  // 2. Create Regional Managers (reporting to Main Admin)
  const regions = ["North", "South", "East", "West"];
  const regionalManagers = [];

  for (const region of regions) {
    const [rm] = await db.insert(users).values({
      kindeId: `kp_rm_${region.toLowerCase()}`,
      email: `rm.${region.toLowerCase()}@viraterp.com`,
      firstName: `${region} Regional`,
      lastName: "Manager",
      role: "Manager",
      managerId: mainAdmin.id,
      isActive: true,
    }).onConflictDoUpdate({
      target: users.kindeId,
      set: { managerId: mainAdmin.id }
    }).returning();
    
    regionalManagers.push(rm);
    console.log(`✅ Created ${region} Regional Manager`);
  }

  // 3. Create Area Managers (reporting to Regional Managers)
  for (const rm of regionalManagers) {
    const areas = ["A1", "A2"];
    for (const area of areas) {
      const [am] = await db.insert(users).values({
        kindeId: `kp_am_${rm!.firstName!.split(' ')[0]!.toLowerCase()}_${area.toLowerCase()}`,
        email: `am.${rm!.firstName!.split(' ')[0]!.toLowerCase()}.${area.toLowerCase()}@viraterp.com`,
        firstName: `${rm!.firstName!.split(' ')[0]} ${area}`,
        lastName: "Area Manager",
        role: "Manager",
        managerId: rm!.id,
        isActive: true,
      }).onConflictDoUpdate({
        target: users.kindeId,
        set: { managerId: rm!.id }
      }).returning();
      
      console.log(`   ✅ Created Area Manager for ${rm!.firstName}`);

      // 4. Create Sales Executives (reporting to Area Managers)
      for (let i = 1; i <= 3; i++) {
        await db.insert(users).values({
          kindeId: `kp_se_${am!.id}_${i}`,
          email: `exec.${am!.id}.${i}@viraterp.com`,
          firstName: `Sales Exec`,
          lastName: `${am!.firstName} #${i}`,
          role: "Employee",
          managerId: am!.id,
          isActive: true,
        }).onConflictDoUpdate({
          target: users.kindeId,
          set: { managerId: am!.id }
        });
      }
      console.log(`      ✅ Created 3 Sales Executives for ${am!.firstName}`);
    }
  }

  console.log("✨ Seeding complete!");
  process.exit(0);
}

seedHierarchy().catch(console.error);
