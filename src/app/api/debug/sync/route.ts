import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("Syncing database via API...");

    // Create enum
    try {
      await db.execute(sql.raw(`CREATE TYPE "public"."virat-crm_file_entity_type" AS ENUM('sale', 'replacement')`));
    } catch (e) {
      console.log("Enum might already exist");
    }

    // Create table
    try {
      await db.execute(sql.raw(`
        CREATE TABLE "virat-crm_file" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "entity_type" "virat-crm_file_entity_type" NOT NULL,
          "entity_id" integer NOT NULL,
          "key" varchar(512) NOT NULL,
          "original_name" varchar(256) NOT NULL,
          "mime_type" varchar(100) NOT NULL,
          "size" integer NOT NULL,
          "uploaded_by" uuid NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        )
      `));
    } catch (e) {
      console.log("Table might already exist");
    }

    // Add FK
    try {
      await db.execute(sql.raw(`
        ALTER TABLE "virat-crm_file" ADD CONSTRAINT "virat-crm_file_uploaded_by_virat-crm_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."virat-crm_user"("id") ON DELETE no action ON UPDATE no action
      `));
    } catch (e) {
      console.log("FK might already exist");
    }

    return NextResponse.json({ success: true, message: "Database synced" });
  } catch (error: any) {
    console.error("Sync failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
