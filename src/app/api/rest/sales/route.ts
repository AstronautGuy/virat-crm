import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { sales } from "@/server/db/schema";
import { eq, and, exists } from "drizzle-orm";
import { saleAssignments } from "@/server/db/schema";
import { getSessionFromHeaders } from "@/server/lib/auth";
import { users } from "@/server/db/schema/users";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account deactivated" },
        { status: 403 },
      );
    }

    // Branch isolation
    if (user.role !== "Admin" && user.role !== "Developer") {
      if (!user.branchId) {
        return NextResponse.json(
          { error: "Forbidden: No branch assignment" },
          { status: 403 },
        );
      }

      const { searchParams } = new URL(request.url);
      const requestedBranchId = searchParams.get("branchId");

      if (requestedBranchId && Number(requestedBranchId) !== user.branchId) {
        return NextResponse.json(
          { error: `Forbidden: Access Denied to Branch ${requestedBranchId}` },
          { status: 403 },
        );
      }

      const employeeCondition = and(
        eq(sales.branchId, user.branchId),
        exists(
          db
            .select()
            .from(saleAssignments)
            .where(
              and(
                eq(saleAssignments.saleId, sales.id),
                eq(saleAssignments.userId, user.id),
              ),
            ),
        ),
      );

      // Filter by branch (and by userId for Employees)
      const data = await db.query.sales.findMany({
        where:
          user.role === "Employee"
            ? employeeCondition
            : eq(sales.branchId, user.branchId),
        orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      });

      return NextResponse.json({ data });
    }

    // Admin/Developer logic
    const { searchParams } = new URL(request.url);
    const requestedBranchId = searchParams.get("branchId");

    const data = await db.query.sales.findMany({
      where: requestedBranchId
        ? eq(sales.branchId, Number(requestedBranchId))
        : undefined,
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[REST_API_SALES_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
