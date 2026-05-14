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

    const customersData = await db.query.customers.findMany({
      with: {
        branch: true,
        creator: true,
      },
      orderBy: (customers, { desc }) => [desc(customers.createdAt)],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Virat CRM";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Customers", {
      views: [{ state: "frozen", ySplit: 1 }]
    });

    sheet.columns = [
      { header: "Customer ID", key: "id", width: 15 },
      { header: "Name", key: "name", width: 30 },
      { header: "Mobile", key: "mobile", width: 18 },
      { header: "Status", key: "status", width: 15 },
      { header: "Branch", key: "branch", width: 20 },
      { header: "Added By", key: "createdBy", width: 25 },
      { header: "Village", key: "village", width: 25 },
      { header: "District", key: "district", width: 20 },
      { header: "State", key: "state", width: 20 },
      { header: "Pincode", key: "pincode", width: 12 },
      { header: "Address", key: "address", width: 40 },
      { header: "Date of Birth", key: "dob", width: 18 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    customersData.forEach((c) => {
      sheet.addRow({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        status: c.status,
        branch: c.branch?.name ?? "N/A",
        createdBy: c.creator ? `${c.creator.firstName} ${c.creator.lastName}` : "N/A",
        village: c.village,
        district: c.district,
        state: c.state,
        pincode: c.pincode,
        address: c.address,
        dob: c.dob ? new Date(c.dob).toLocaleDateString() : "N/A",
        createdAt: new Date(c.createdAt).toLocaleDateString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="customers-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

