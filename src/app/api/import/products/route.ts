import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/lib/auth";
import { db } from "@/server/db";
import { products } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, session?.userId ?? ""),
    });

    if (user?.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json({ error: "Empty workbook" }, { status: 400 });
    }

    const results = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };

    const errors: { row: number; error: string }[] = [];
    const productsToUpsert: (typeof products.$inferInsert)[] = [];

    // Find headers
    let nameCol = -1;
    let skuCol = -1;
    let priceCol = -1;

    worksheet.getRow(1).eachCell((cell, colNumber) => {
      const header = cell.text.toLowerCase().trim();
      if (header === "name") nameCol = colNumber;
      if (header === "sku") skuCol = colNumber;
      if (header === "price") priceCol = colNumber;
    });

    if (nameCol === -1 || skuCol === -1 || priceCol === -1) {
      return NextResponse.json(
        {
          error: "Missing required columns. Required: Name, SKU, Price",
        },
        { status: 400 },
      );
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const name = row.getCell(nameCol).text.trim();
      const sku = row.getCell(skuCol).text.trim();
      const cellValue = row.getCell(priceCol).value;
      const priceRaw = cellValue ?? null;

      if (!name || !sku || priceRaw === null) {
        results.failed++;
        errors.push({ row: rowNumber, error: "Missing required fields" });
        return;
      }

      const price =
        typeof priceRaw === "number"
          ? priceRaw
          : parseFloat(row.getCell(priceCol).text);
      if (isNaN(price)) {
        results.failed++;
        errors.push({ row: rowNumber, error: "Invalid price format" });
        return;
      }

      productsToUpsert.push({
        name,
        sku,
        price: price.toFixed(2),
      });
      results.total++;
    });

    if (productsToUpsert.length > 0) {
      // Perform batch upsert
      // Drizzle doesn't directly return which ones were created vs updated in a batch
      // but we can estimate based on row count if we were doing it one by one.
      // For now, we'll report total processed.
      await db
        .insert(products)
        .values(productsToUpsert)
        .onConflictDoUpdate({
          target: products.sku,
          set: {
            name: sql`excluded.name`,
            price: sql`excluded.price`,
            updatedAt: new Date(),
          },
        });

      // Since we don't know the split easily without a pre-check, we'll just return total processed
      // Or we can say "Processed" instead of created/updated
    }

    return NextResponse.json({
      success: true,
      summary: results,
      errors,
    });
  } catch (error) {
    console.error("[IMPORT_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
