// seed.js — Runs schema.sql on the connected Neon database to create tables + seed data
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to Neon database. Running schema.sql...\n');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema created and all seed data inserted successfully!\n');
    
    // Verify
    const hotels = await client.query('SELECT name, district FROM hotels ORDER BY name');
    console.log(`📦 Hotels seeded: ${hotels.rows.length}`);
    hotels.rows.forEach(h => console.log(`   • ${h.name} (${h.district})`));
    
    const rooms = await client.query('SELECT COUNT(*) FROM rooms');
    console.log(`🛏️  Rooms seeded: ${rooms.rows[0].count}`);
    
    const coupons = await client.query('SELECT code FROM coupons');
    console.log(`🎟️  Coupons seeded: ${coupons.rows.map(c => c.code).join(', ')}`);
    
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
