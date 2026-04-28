const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function drop() {
  await sql`DROP TABLE IF EXISTS "virat-crm_location_logs" CASCADE`;
  console.log('Dropped');
  process.exit(0);
}
drop();
