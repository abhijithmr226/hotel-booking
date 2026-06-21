// migrate.js — Add map_url and images columns to hotels table
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
  await client.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS map_url TEXT DEFAULT ''");
  await client.query("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb");
  console.log('✅ Columns added: map_url, images');
  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='hotels' ORDER BY ordinal_position");
  console.log('📋 Hotel columns now:', cols.rows.map(r => r.column_name).join(', '));
} finally {
  client.release();
  await pool.end();
}
