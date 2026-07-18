import "dotenv/config";
import { db } from "../src/server/db";
import {
  users,
  branches,
  customers,
  sales,
  saleItems,
  saleAssignments,
  userManagers,
  products,
} from "../src/server/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Generating fake sales per employee and manager...");

  // Fetch all employees
  const allEmployees = await db.query.users.findMany({
    where: eq(users.role, "Employee"),
    with: {
      managers: {
        with: {
          manager: true,
        },
      },
    },
  });

  if (allEmployees.length === 0) {
    console.error("No employees found!");
    process.exit(1);
  }

  // Fetch products
  const allProducts = await db.query.products.findMany();
  if (allProducts.length === 0) {
    console.error("No products found! Please run regular seed first.");
    process.exit(1);
  }

  const allBranches = await db.query.branches.findMany();
  if (allBranches.length === 0) {
    console.error("No branches found!");
    process.exit(1);
  }

  const allCustomers = await db.query.customers.findMany();

  const salesToInsert = [];
  const assignmentsToInsert = [];
  const itemsToInsert = [];

  const now = new Date();
  let orderCounter = 2000; // Starting order number to avoid conflicts

  for (const employee of allEmployees) {
    // Generate 3-8 sales per employee
    const numSales = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < numSales; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const saleDate = new Date(now);
      saleDate.setDate(now.getDate() - daysAgo);

      const branchId =
        employee.branchId ??
        allBranches[Math.floor(Math.random() * allBranches.length)]!.id;

      const customer =
        allCustomers.length > 0 && Math.random() > 0.3
          ? allCustomers[Math.floor(Math.random() * allCustomers.length)]
          : null;

      const invoiceAmount = Math.floor(Math.random() * 50000) + 5000;
      const advanceAmount = Math.random() > 0.5 ? Math.floor(invoiceAmount * 0.2) : 0;
      const balanceAmount = invoiceAmount - advanceAmount;

      const orderNumber = `F-ORD-${orderCounter++}`;

      salesToInsert.push({
        branchId,
        userId: employee.id,
        orderDate: saleDate,
        invoiceDate: saleDate,
        orderNumber,
        transactionNumber: `TXN-${orderNumber}`,
        status: Math.random() > 0.2 ? "Approved" : "Pending",
        customerName: customer ? customer.name : `Walk-in Customer ${orderCounter}`,
        customerId: customer ? customer.id : null,
        invoiceAmount: invoiceAmount.toString(),
        advancePaymentAmount: advanceAmount.toString(),
        receivedAmount: advanceAmount.toString(),
        balanceAmount: balanceAmount.toString(),
        mainQty: Math.floor(Math.random() * 100) + 10,
        freeQty: Math.floor(Math.random() * 5),
        totalQty: 0, // will compute
        createdAt: saleDate,
        updatedAt: saleDate,
      });

      // Prepare items and assignments structure (we need inserted sale IDs first, so we use orderNumber to map back)
    }
  }

  console.log(`Inserting ${salesToInsert.length} sales...`);

  const insertedSales = await db.insert(sales).values(salesToInsert as any).returning();

  for (const insertedSale of insertedSales) {
    const employee = allEmployees.find((e) => e.id === insertedSale.userId);
    if (!employee) continue;

    // Assignment for employee
    assignmentsToInsert.push({
      saleId: insertedSale.id,
      userId: employee.id,
      role: "Employee",
    });

    // Assignments for managers
    for (const um of employee.managers) {
      assignmentsToInsert.push({
        saleId: insertedSale.id,
        userId: um.managerId,
        role: "Manager",
      });
    }

    // Generate items
    const numItems = Math.floor(Math.random() * 3) + 1;
    let totalMain = 0;
    for (let j = 0; j < numItems; j++) {
      const prod = allProducts[Math.floor(Math.random() * allProducts.length)]!;
      const qty = Math.floor(Math.random() * 50) + 5;
      totalMain += qty;
      itemsToInsert.push({
        saleId: insertedSale.id,
        productId: prod.id,
        quantity: qty,
        isFree: false,
      });
    }
  }

  console.log(`Inserting ${assignmentsToInsert.length} assignments...`);
  await db.insert(saleAssignments).values(assignmentsToInsert as any);

  console.log(`Inserting ${itemsToInsert.length} sale items...`);
  await db.insert(saleItems).values(itemsToInsert as any);

  console.log("Successfully generated fake sales per employee/manager hierarchy!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Failed to generate fake sales:", e);
  process.exit(1);
});
