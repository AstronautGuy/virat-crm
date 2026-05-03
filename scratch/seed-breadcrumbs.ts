import { db } from "../src/server/db";
import { breadcrumbs } from "../src/server/db/schema";

async function seed() {
  const userId = "45636068-a68e-45f3-b908-393da3a11515"; // Test Employee
  
  const points = [
    { lat: 18.5204, lng: 73.8567, offset: 0 }, // Pune
    { lat: 18.5250, lng: 73.8600, offset: 5 },
    { lat: 18.5300, lng: 73.8650, offset: 10 },
    { lat: 18.5350, lng: 73.8700, offset: 15 },
    { lat: 18.5400, lng: 73.8750, offset: 20 },
  ];

  for (const p of points) {
    const createdAt = new Date(Date.now() - p.offset * 60 * 1000);
    await db.insert(breadcrumbs).values({
      userId,
      latitude: p.lat,
      longitude: p.lng,
      accuracy: 10,
      createdAt,
    });
  }

  console.log("Seeded 5 breadcrumbs for Test Employee in Pune");
  process.exit(0);
}

seed();
