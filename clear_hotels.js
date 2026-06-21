// clear_hotels.js — Remove ALL seeded/fake hotels and rooms from Neon DB
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();
try {
  const before = await client.query("SELECT COUNT(*) FROM hotels");
  console.log(`🗑️  Hotels before: ${before.rows[0].count}`);

  await client.query("DELETE FROM rooms");
  await client.query("DELETE FROM hotels");

  const after = await client.query("SELECT COUNT(*) FROM hotels");
  const afterR = await client.query("SELECT COUNT(*) FROM rooms");
  console.log(`✅ Hotels after: ${after.rows[0].count}`);
  console.log(`✅ Rooms after: ${afterR.rows[0].count}`);
  console.log('🧹 Database is clean and ready for real hotels!');
} finally {
  client.release();
  await pool.end();
}
