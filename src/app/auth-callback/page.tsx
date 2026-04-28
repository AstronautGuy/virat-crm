import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export default async function AuthCallbackPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id || !user.email) {
    redirect("/");
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.kindeId, user.id),
  });

  if (!existingUser) {
    // Sync new user to local database
    await db.insert(users).values({
      kindeId: user.id,
      email: user.email,
      firstName: user.given_name ?? "Unknown",
      lastName: user.family_name ?? "Unknown",
    });
  }

  // Redirect to dashboard (or home if dashboard doesn't exist yet)
  redirect("/dashboard");
}
