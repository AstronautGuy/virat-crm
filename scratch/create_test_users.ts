import "dotenv/config";
import { db } from "../src/server/db/index";
import { users, branches } from "../src/server/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Starting test user creation script...");

  // Get dynamic branch
  const existingBranch = await db.query.branches.findFirst();
  if (!existingBranch) {
    console.error("Error: No branch found in the database. Please seed branches first.");
    process.exit(1);
  }
  const branchId = existingBranch.id;
  console.log(`Using branch: ${existingBranch.name} (ID: ${branchId})`);

  // Hash password
  const rawPassword = "Password@123";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Managers configuration
  const managerData = [
    {
      employeeCode: "MGR002",
      email: "manager2@viraterp.com",
      firstName: "Alice",
      lastName: "Johnson",
      role: "Manager",
      branchId,
      password: hashedPassword,
      isActive: true,
    },
    {
      employeeCode: "MGR003",
      email: "manager3@viraterp.com",
      firstName: "Bob",
      lastName: "Smith",
      role: "Manager",
      branchId,
      password: hashedPassword,
      isActive: true,
    },
  ];

  const createdManagers = [];
  for (const mgr of managerData) {
    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.employeeCode, mgr.employeeCode),
    });

    if (existing) {
      console.log(`Manager ${mgr.employeeCode} already exists.`);
      createdManagers.push(existing);
    } else {
      const [inserted] = await db.insert(users).values(mgr).returning();
      if (inserted) {
        console.log(`Created Manager: ${inserted.firstName} (${inserted.employeeCode})`);
        createdManagers.push(inserted);
      }
    }
  }

  // Employees configuration
  const employeeNames = [
    { first: "Charlie", last: "Brown" },
    { first: "David", last: "Miller" },
    { first: "Eva", last: "Davis" },
    { first: "Frank", last: "Garcia" },
    { first: "Grace", last: "Rodriguez" },
    { first: "Henry", last: "Wilson" },
    { first: "Ivy", last: "Thomas" },
    { first: "Jack", last: "Anderson" },
    { first: "Karen", last: "Taylor" },
    { first: "Leo", last: "Moore" },
  ];

  console.log("\nCreating 10 Employees...");
  const credentialsTable = [];

  // Add managers to credentials list for reporting
  for (const mgr of createdManagers) {
    credentialsTable.push({
      Name: `${mgr.firstName} ${mgr.lastName}`,
      Role: mgr.role,
      "Employee Code (Ecode)": mgr.employeeCode,
      Email: mgr.email,
      Password: rawPassword,
    });
  }

  for (let i = 0; i < employeeNames.length; i++) {
    const num = i + 2; // EMP002 to EMP011
    const empCode = `EMP${String(num).padStart(3, "0")}`;
    const nameInfo = employeeNames[i]!;
    
    // Distribute managers evenly among employees
    const assignedManager = createdManagers[i % createdManagers.length];

    const empData = {
      employeeCode: empCode,
      email: `${nameInfo.first.toLowerCase()}${num}@viraterp.com`,
      firstName: nameInfo.first,
      lastName: nameInfo.last,
      role: "Employee",
      branchId,
      managerId: assignedManager ? assignedManager.id : null,
      password: hashedPassword,
      isActive: true,
    };

    const existing = await db.query.users.findFirst({
      where: eq(users.employeeCode, empCode),
    });

    if (existing) {
      console.log(`Employee ${empCode} already exists.`);
      credentialsTable.push({
        Name: `${existing.firstName} ${existing.lastName}`,
        Role: existing.role,
        "Employee Code (Ecode)": existing.employeeCode,
        Email: existing.email,
        Password: rawPassword,
      });
    } else {
      const [inserted] = await db.insert(users).values(empData).returning();
      if (inserted) {
        console.log(`Created Employee: ${inserted.firstName} (${inserted.employeeCode}) assigned to manager ${assignedManager?.employeeCode}`);
        credentialsTable.push({
          Name: `${inserted.firstName} ${inserted.lastName}`,
          Role: inserted.role,
          "Employee Code (Ecode)": inserted.employeeCode,
          Email: inserted.email,
          Password: rawPassword,
        });
      }
    }
  }

  console.log("\n==============================================================");
  console.log("SUCCESSFULLY GENERATED TEST USERS CREDENTIALS");
  console.log("==============================================================");
  console.table(credentialsTable);
  console.log("==============================================================\n");

  process.exit(0);
}

run().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
