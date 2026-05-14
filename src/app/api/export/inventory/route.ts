import { NextResponse } from "next/server";
import { getSession } from "@/server/lib/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    if (user?.role !== "Admin") return new NextResponse("Forbidden", { status: 403 });

    // Query inventory directly with product + branch relations
    const inventoryRows = await db.query.inventory.findMany({
      with: {
        product: true,
        branch: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Virat CRM";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Inventory Status", {
      views: [{ state: "frozen", ySplit: 1 }]
    });

    sheet.columns = [
      { header: "Product ID", key: "productId", width: 15 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Unit Price (₹)", key: "price", width: 18 },
      { header: "Branch", key: "branch", width: 25 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Last Updated", key: "updatedAt", width: 20 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } }; // Slate 900
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    inventoryRows.forEach((inv) => {
      sheet.addRow({
        productId: inv.productId,
        sku: inv.product?.sku ?? "N/A",
        name: inv.product?.name ?? "Unknown",
        price: Number(inv.product?.price ?? 0),
        branch: inv.branch?.name ?? "Unknown",
        quantity: inv.quantity,
        updatedAt: inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : "N/A",
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inventory-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
