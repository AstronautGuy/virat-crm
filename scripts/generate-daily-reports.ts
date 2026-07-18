import "dotenv/config";
import { db } from "../src/server/db";
import { users, branches, customers, dailyReports } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

const contents = [
  "Visited the client office for a product demonstration.",
  "Followed up on the pending invoice from last week.",
  "Cold called 15 prospects in the manufacturing sector.",
  "Attended team meeting and updated the weekly tracker.",
  "Negotiated terms for the new bulk order contract.",
  "Conducted training session for the new product line.",
  "Resolved customer complaints regarding delayed shipping.",
  "Completed market research for the upcoming quarter.",
];

async function run() {
  console.log("Generating fake daily reports...");

  // Fetch all employees
  const allUsers = await db.query.users.findMany({
    where: eq(users.role, "Employee"),
  });

  if (allUsers.length === 0) {
    console.error("No employees found to assign reports to!");
    process.exit(1);
  }

  // Fetch all branches
  const allBranches = await db.query.branches.findMany();
  
  if (allBranches.length === 0) {
    console.error("No branches found!");
    process.exit(1);
  }

  // Fetch all customers (optional for reports)
  const allCustomers = await db.query.customers.findMany();

  const reportsToInsert = [];
  const now = new Date();

  // Generate 5-10 reports per employee over the last 14 days
  for (const user of allUsers) {
    const numReports = Math.floor(Math.random() * 6) + 5; // 5 to 10
    
    for (let i = 0; i < numReports; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const reportDate = new Date(now);
      reportDate.setDate(now.getDate() - daysAgo);
      
      // Randomize time during work hours (9 AM to 6 PM)
      reportDate.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0);

      const content = contents[Math.floor(Math.random() * contents.length)];
      
      const branchId = user.branchId ?? allBranches[Math.floor(Math.random() * allBranches.length)]!.id;
      
      // 50% chance to associate with a customer
      const customerId = (allCustomers.length > 0 && Math.random() > 0.5) 
        ? allCustomers[Math.floor(Math.random() * allCustomers.length)]!.id 
        : null;

      reportsToInsert.push({
        userId: user.id,
        branchId,
        reportDate,
        content: content!,
        customerId,
        createdAt: reportDate,
        updatedAt: reportDate,
      });
    }
  }

  console.log(`Inserting ${reportsToInsert.length} daily reports...`);
  
  // Insert in batches of 50
  for (let i = 0; i < reportsToInsert.length; i += 50) {
    const batch = reportsToInsert.slice(i, i + 50);
    await db.insert(dailyReports).values(batch);
  }

  console.log("Successfully generated fake daily reports!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Failed to generate daily reports:", e);
  process.exit(1);
});
