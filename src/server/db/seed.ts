import { db } from "./index";
import { branches, users, products, sales, saleItems, replacements, inventory, roles, rolePermissions } from "./schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Truncate tables to allow re-seeding
  await db.execute(sql`TRUNCATE TABLE "virat-crm_role_permission" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_stock_transfer" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_inventory_transaction" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_inventory" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_replacement" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_sale_item" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_sale" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_product" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_user" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_roles" CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE "virat-crm_branch" CASCADE;`);

  // Hash passwords
  const password = await bcrypt.hash("password123", 10);

  // Seed Roles
  const insertedRoles = await db
    .insert(roles)
    .values([
      { name: "Admin", isSystem: true, description: "System Administrator" },
      { name: "Manager", isSystem: true, description: "Branch Manager" },
      { name: "Employee", isSystem: true, description: "Field Employee" }
    ])
    .returning();
  console.log("Roles seeded:", insertedRoles.length);

  // Seed Role Permissions
  await db
    .insert(rolePermissions)
    .values([
      // Admin permissions
      { role: "Admin", featureKey: "dashboard", isEnabled: true },
      { role: "Admin", featureKey: "crm", isEnabled: true },
      { role: "Admin", featureKey: "sales", isEnabled: true },
      { role: "Admin", featureKey: "inventory", isEnabled: true },
      { role: "Admin", featureKey: "workforce", isEnabled: true },
      { role: "Admin", featureKey: "documents", isEnabled: true },
      { role: "Admin", featureKey: "replacements", isEnabled: true },
      { role: "Admin", featureKey: "performance", isEnabled: true },

      // Manager permissions
      { role: "Manager", featureKey: "dashboard", isEnabled: true },
      { role: "Manager", featureKey: "crm", isEnabled: true },
      { role: "Manager", featureKey: "sales", isEnabled: true },
      { role: "Manager", featureKey: "inventory", isEnabled: true },
      { role: "Manager", featureKey: "workforce", isEnabled: true },
      { role: "Manager", featureKey: "documents", isEnabled: true },
      { role: "Manager", featureKey: "replacements", isEnabled: true },
      { role: "Manager", featureKey: "performance", isEnabled: true },

      // Employee permissions
      { role: "Employee", featureKey: "dashboard", isEnabled: true },
      { role: "Employee", featureKey: "crm", isEnabled: true },
      { role: "Employee", featureKey: "sales", isEnabled: true },
      { role: "Employee", featureKey: "inventory", isEnabled: true },
      { role: "Employee", featureKey: "documents", isEnabled: true },
      { role: "Employee", featureKey: "replacements", isEnabled: true },
    ]);
  console.log("Role permissions seeded");

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
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        employeeCode: "ADMIN001",
        password: password,
        email: "admin@viraterp.com",
        firstName: "System",
        lastName: "Admin",
        role: "Admin",
        branchId: hq.id,
        isActive: true,
      },
      {
        employeeCode: "EMP001", 
        password: password,
        email: "employee1@viraterp.com",
        firstName: "Test",
        lastName: "Employee",
        role: "Employee",
        branchId: hq.id,
        isActive: true,
      },
      {
        employeeCode: "MGR001",
        password: password,
        email: "manager@viraterp.com",
        firstName: "Mock",
        lastName: "Manager",
        role: "Manager",
        branchId: hq.id,
        isActive: true,
      }
    ])
    .returning();

  console.log("Users seeded:", insertedUsers.length);
  const employee = insertedUsers[1];
  const manager = insertedUsers[2];

  // Seed Products
  const insertedProducts = await db
    .insert(products)
    .values([
      { name: "Virat Premium Cement", sku: "VPC-001", price: "350.00" },
      { name: "Virat Standard Cement", sku: "VSC-002", price: "280.00" },
      { name: "Virat Quick-Dry", sku: "VQD-003", price: "400.00" },
    ])
    .returning();
  
  console.log("Products seeded:", insertedProducts.length);
  const p1 = insertedProducts[0]!;
  const p2 = insertedProducts[1]!;

  // Seed Sales
  const insertedSales = await db
    .insert(sales)
    .values([
      {
        branchId: hq.id,
        orderNumber: "ORD-1001",
        transactionNumber: "TXN-1001",
        status: "Approved",
        userId: employee!.id,
        managerId: manager!.id,
        pincode: "110001",
        customerName: "Ramesh Builders",
        customerAddress: "New Delhi",
        mainQty: 100,
        freeQty: 10,
        totalQty: 110,
        invoiceAmount: "35000.00",
        receivedAmount: "35000.00",
        balanceAmount: "0.00",
      },
      {
        branchId: hq.id,
        orderNumber: "ORD-1002",
        status: "Pending",
        userId: employee!.id,
        managerId: manager!.id,
        pincode: "110002",
        customerName: "Suresh Constructions",
        customerAddress: "South Delhi",
        mainQty: 50,
        freeQty: 0,
        totalQty: 50,
        invoiceAmount: "14000.00",
        receivedAmount: "5000.00",
        balanceAmount: "9000.00",
      }
    ])
    .returning();

  console.log("Sales seeded:", insertedSales.length);
  const sale1 = insertedSales[0]!;
  const sale2 = insertedSales[1]!;

  // Seed Sale Items
  await db.insert(saleItems).values([
    { saleId: sale1.id, productId: p1.id, quantity: 100, isFree: false },
    { saleId: sale1.id, productId: p2.id, quantity: 10, isFree: true },
    { saleId: sale2.id, productId: p2.id, quantity: 50, isFree: false },
  ]);
  console.log("Sale Items seeded");

  // Seed Inventory
  await db.insert(inventory).values([
    { productId: p1.id, branchId: hq.id, quantity: 1000 },
    { productId: p2.id, branchId: hq.id, quantity: 2000 },
    { productId: insertedProducts[2]!.id, branchId: hq.id, quantity: 500 },
  ]);
  console.log("Inventory seeded");

  // Seed Replacements
  await db.insert(replacements).values([
    {
      originalSaleId: sale1.id,
      branchId: hq.id,
      userId: employee!.id,
      reason: "Bags were torn during transit",
      status: "Pending",
    },
    {
      originalSaleId: sale2.id,
      branchId: hq.id,
      userId: employee!.id,
      reason: "Quality check failed",
      status: "Approved",
    }
  ]);
  console.log("Replacements seeded");

  console.log("Database seeding completed.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
