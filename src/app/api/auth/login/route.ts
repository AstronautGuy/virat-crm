import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";
import { login } from "@/server/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { employeeCode?: string; password?: string };
  const { employeeCode, password } = body;

  if (!employeeCode || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: employeeCode ? eq(users.employeeCode, employeeCode) : undefined,
  });

  if (!user?.isActive) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Check password
  if (!user.password) {
    // If user has no password set (migration case), they should probably set one first.
    // For now, let's assume they use a default password or handle it.
    // If we want to allow migration, we could check against a temporary default.
    return NextResponse.json({ error: "Password not set. Please contact admin." }, { status: 401 });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session
  await login(user.id);

  return NextResponse.json({ success: true });
}
