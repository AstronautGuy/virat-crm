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

    // Fetch all sales with relations
    const salesData = await db.query.sales.findMany({
      with: {
        user: true,
        branch: true,
        customer: true,
        items: {
          with: { product: true }
        }
      },
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Virat CRM";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Sales Data", {
      views: [{ state: "frozen", ySplit: 1 }]
    });

    sheet.columns = [
      { header: "Order Number", key: "orderNumber", width: 15 },
      { header: "Date", key: "orderDate", width: 20 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Employee", key: "employee", width: 25 },
      { header: "Customer Name", key: "customerName", width: 30 },
      { header: "Pincode", key: "pincode", width: 15 },
      { header: "Total Qty", key: "totalQty", width: 15 },
      { header: "Invoice Amount", key: "invoiceAmount", width: 20 },
      { header: "Advance Received", key: "advancePaymentAmount", width: 20 },
      { header: "Balance", key: "balanceAmount", width: 20 },
      { header: "Items Summary", key: "itemsSummary", width: 50 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } }; // Slate 900
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    salesData.forEach((s) => {
      const itemsSummary = s.items
        .map(item => `${item.product?.name ?? "Unknown"} (${item.quantity})`)
        .join(", ");

      sheet.addRow({
        orderNumber: s.orderNumber,
        orderDate: new Date(s.orderDate).toLocaleDateString(),
        branch: s.branch?.name ?? "Unknown",
        status: s.status,
        employee: s.user ? `${s.user.firstName} ${s.user.lastName}` : "Unknown",
        customerName: s.customer?.name ?? s.customerName ?? "N/A",
        pincode: s.pincode ?? "N/A",
        totalQty: s.totalQty,
        invoiceAmount: Number(s.invoiceAmount ?? 0),
        advancePaymentAmount: Number(s.advancePaymentAmount ?? 0),
        balanceAmount: Number(s.balanceAmount ?? 0),
        itemsSummary,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="sales-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
