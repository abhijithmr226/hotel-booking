import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function wipe() {
  try {
    console.log("Wiping database...");
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM rooms');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM hotels');
    console.log("Database wiped successfully.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

wipe();
