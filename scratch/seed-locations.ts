import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/server/db/schema/users";
import { locationLogs } from "../src/server/db/schema/locationLogs";
import { eq, not } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seedLocations() {
  console.log("📍 Seeding fake locations for all employees...");

  const allUsers = await db.query.users.findMany();
  
  if (allUsers.length === 0) {
    console.error("❌ No users found to seed locations for.");
    return;
  }

  // Base coordinates (Delhi, India)
  const baseLat = 28.6139;
  const baseLng = 77.2090;

  for (const user of allUsers) {
    // Generate a random location within ~10km
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    await db.insert(locationLogs).values({
      userId: user.id,
      latitude: (baseLat + latOffset).toString(),
      longitude: (baseLng + lngOffset).toString(),
      accuracy: (Math.random() * 50 + 10).toString(), // 10-60m accuracy
      timestamp: new Date(),
    });
    
    console.log(`✅ Logged location for ${user.firstName} ${user.lastName}`);
  }

  console.log("✨ Location seeding complete!");
  process.exit(0);
}

seedLocations().catch(console.error);
