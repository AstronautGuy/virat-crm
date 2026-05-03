import { db } from "./index";
import { sql } from "drizzle-orm";

async function check() {
  const result = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'files';
  `);
  console.log(result);
  process.exit(0);
}

check();
