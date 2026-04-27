import { db } from "./index";
import { branches, users } from "./schema";

async function main() {
  console.log("Seeding database...");

  // Seed Branches
  const insertedBranches = await db
    .insert(branches)
    .values([
      {
        name: "Headquarters",
        latitude: "28.6139",
        longitude: "77.2090",
        radiusMeters: 100,
        isActive: true,
      },
      {
        name: "North Branch",
        latitude: "28.7041",
        longitude: "77.1025",
        radiusMeters: 50,
        isActive: true,
      },
    ])
    .returning();

  console.log("Branches seeded:", insertedBranches.length);

  const hq = insertedBranches[0];

  if (!hq) {
    throw new Error("Failed to insert Headquarters branch");
  }

  // Seed Users (Admin)
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        kindeId: "kp_c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6", // Example Kinde ID
        email: "admin@viraterp.com",
        firstName: "System",
        lastName: "Admin",
        role: "Admin",
        branchId: hq.id,
        isActive: true,
      },
      {
        kindeId: "kp_mock_employee_123", 
        email: "employee1@viraterp.com",
        firstName: "Test",
        lastName: "Employee",
        role: "Employee",
        branchId: hq.id,
        isActive: true,
      },
    ])
    .returning();

  console.log("Users seeded:", insertedUsers.length);
  console.log("Database seeding completed.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
