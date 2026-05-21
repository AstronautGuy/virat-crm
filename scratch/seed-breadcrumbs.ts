import { db } from "../src/server/db";
import { breadcrumbs } from "../src/server/db/schema";

async function seed() {
  const userId = "45636068-a68e-45f3-b908-393da3a11515"; // Test Employee

  const points = [
    { lat: 18.5204, lng: 73.8567, offset: 0 }, // Pune
    { lat: 18.525, lng: 73.86, offset: 5 },
    { lat: 18.53, lng: 73.865, offset: 10 },
    { lat: 18.535, lng: 73.87, offset: 15 },
    { lat: 18.54, lng: 73.875, offset: 20 },
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
