import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

// Test connection and auto-initialize schema
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.message);
    if (process.env.DATABASE_URL?.includes('[YOUR-PASSWORD]')) {
      console.error('\n=============================================================');
      console.error('ERROR: Please update your DATABASE_URL password in the .env file!');
      console.error('Replace [YOUR-PASSWORD] with your actual database password.');
      console.error('=============================================================\n');
    }
    return;
  }
  console.log('✅ Neon PostgreSQL connected successfully!');
  
  // Check if tables exist by querying hotels
  try {
    await client.query('SELECT 1 FROM hotels LIMIT 1');
    console.log('✅ Database tables verified.');
  } catch (schemaErr) {
    console.log('ℹ️  Tables do not exist. Initializing schema.sql...');
    try {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schemaSql);
      console.log('✅ Schema tables created and seeded successfully!');
    } catch (initErr) {
      console.error('❌ Failed to run schema initialization script:', initErr.message);
    }
  } finally {
    release();
  }
});


// ─── SQL column mapping utilities ──────────────────────────────────────────
function mapHotelRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    district: row.district,
    category: row.category,
    rating: parseFloat(row.rating),
    reviewsCount: row.reviews_count,
    price: row.price,
    tax: row.tax,
    image: row.image,
    images: row.images || [],
    mapUrl: row.map_url || '',
    whatsapp: row.whatsapp,
    distance: row.distance,
    badge: row.badge,
    description: row.description,
    amenities: row.amenities || [],
    highlights: row.highlights || [],
    details: row.details || {},
    nearby: row.nearby || [],
    featured: row.featured,
    trending: row.trending,
    status: row.status
  };
}

function mapRoomRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    hotelId: row.hotel_id,
    hotelName: row.hotel_name,
    roomNumber: row.room_number,
    type: row.type,
    capacity: row.capacity,
    price: row.price,
    beds: row.beds,
    availability: row.availability,
    amenities: row.amenities || [],
    inventory: row.inventory
  };
}

function mapCouponRow(row) {
  if (!row) return null;
  const expiry = row.expiry_date ? new Date(row.expiry_date).toISOString().split('T')[0] : null;
  return {
    code: row.code,
    discountPercent: row.discount_percent,
    expiryDate: expiry,
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    minBookingAmount: row.min_booking_amount,
    status: row.status
  };
}

function mapBookingRow(row) {
  if (!row) return null;
  const checkIn = row.check_in ? new Date(row.check_in).toISOString().split('T')[0] : null;
  const checkOut = row.check_out ? new Date(row.check_out).toISOString().split('T')[0] : null;
  return {
    bookingId: row.booking_id,
    hotelId: row.hotel_id,
    hotelName: row.hotel_name,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    userPhone: row.user_phone,
    guestName: row.user_name,
    guestPhone: row.user_phone,
    roomType: row.room_type,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: row.guests,
    roomsCount: row.rooms_count,
    totalPrice: row.total_price,
    amount: row.total_price,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    uid: row.uid,
    name: row.name,
    email: row.email,
    phone: row.phone,
    photoURL: row.photo_url,
    role: row.role,
    createdAt: row.created_at
  };
}

function mapReviewRow(row) {
  if (!row) return null;
  return {
    reviewId: row.review_id,
    hotelId: row.hotel_id,
    hotelName: row.hotel_name,
    userId: row.user_id,
    userName: row.user_name,
    userPhoto: row.user_photo,
    rating: row.rating,
    comment: row.comment,
    replyText: row.reply_text,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapAuditLogRow(row) {
  if (!row) return null;
  return {
    logId: row.log_id,
    operatorId: row.operator_id,
    operatorEmail: row.operator_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    previousValue: row.previous_value,
    newValue: row.new_value,
    timestamp: row.timestamp
  };
}

function mapSystemUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    permissions: row.permissions,
    status: row.status
  };
}

function mapFavoriteRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    hotelId: row.hotel_id,
    createdAt: row.created_at
  };
}

// ─── Dynamic UPDATE statement generator ────────────────────────────────────
async function updateRecord(table, idColumn, idValue, updates, keyMap) {
  const keys = Object.keys(updates);
  if (keys.length === 0) return;
  const setClauses = [];
  const values = [];
  let paramIndex = 1;
  for (const key of keys) {
    const dbKey = keyMap[key] || key;
    setClauses.push(`${dbKey} = $${paramIndex}`);
    let val = updates[key];
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
    }
    values.push(val);
    paramIndex++;
  }
  values.push(idValue);
  const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${idColumn} = $${paramIndex}`;
  await pool.query(query, values);
}

// Key maps for camelCase keys to snake_case column names
const hotelsKeyMap = { reviewsCount: 'reviews_count', mapUrl: 'map_url' };
const roomsKeyMap = { hotelId: 'hotel_id', hotelName: 'hotel_name', roomNumber: 'room_number' };
const couponsKeyMap = {
  discountPercent: 'discount_percent', expiryDate: 'expiry_date',
  usageLimit: 'usage_limit', usageCount: 'usage_count', minBookingAmount: 'min_booking_amount'
};
const bookingsKeyMap = {
  hotelId: 'hotel_id', hotelName: 'hotel_name', userId: 'user_id', userName: 'user_name',
  userEmail: 'user_email', userPhone: 'user_phone', roomType: 'room_type',
  checkIn: 'check_in', checkOut: 'check_out', roomsCount: 'rooms_count', totalPrice: 'total_price'
};
const usersKeyMap = { photoURL: 'photo_url' };
const reviewsKeyMap = {
  hotelId: 'hotel_id', hotelName: 'hotel_name', userId: 'user_id', userName: 'user_name',
  userPhoto: 'user_photo', replyText: 'reply_text'
};
const favoritesKeyMap = { userId: 'user_id', hotelId: 'hotel_id' };

// ─── Express API routes ───────────────────────────────────────────────────

// CONFIG / SETTINGS
app.get('/api/config/:key', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM config WHERE key = $1', [req.params.key]);
    if (result.rows.length === 0) return res.json({});
    res.json(result.rows[0].value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config/:key', async (req, res) => {
  try {
    const val = JSON.stringify(req.body);
    await pool.query(
      'INSERT INTO config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [req.params.key, val]
    );
    res.json({ message: 'Config updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HOTELS
app.get('/api/hotels', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotels ORDER BY name ASC');
    res.json(result.rows.map(mapHotelRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const h = req.body;
    await pool.query(
      `INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, images, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21, $22, $23)`,
      [
        h.id, h.name, h.location, h.district, h.category, h.rating || 4.5, h.reviewsCount || 0, h.price, h.tax, h.image,
        JSON.stringify(h.images || []), h.mapUrl || '', h.whatsapp, h.distance || '', h.badge || 'Newly Added', h.description,
        JSON.stringify(h.amenities || []), JSON.stringify(h.highlights || []),
        JSON.stringify(h.details || {}), JSON.stringify(h.nearby || []), h.featured || false, h.trending || false, h.status || 'active'
      ]
    );
    res.status(201).json({ message: 'Hotel added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hotels/:id', async (req, res) => {
  try {
    await updateRecord('hotels', 'id', req.params.id, req.body, hotelsKeyMap);
    res.json({ message: 'Hotel updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hotels/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROOMS
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms');
    res.json(result.rows.map(mapRoomRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const r = req.body;
    await pool.query(
      `INSERT INTO rooms (id, hotel_id, hotel_name, room_number, type, capacity, price, beds, availability, amenities, inventory)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
      [r.id, r.hotelId, r.hotelName, r.roomNumber, r.type, r.capacity, r.price, r.beds, r.availability || 'available', JSON.stringify(r.amenities || []), r.inventory]
    );
    res.status(201).json({ message: 'Room added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    await updateRecord('rooms', 'id', req.params.id, req.body, roomsKeyMap);
    res.json({ message: 'Room updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COUPONS
app.get('/api/coupons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons');
    res.json(result.rows.map(mapCouponRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const c = req.body;
    await pool.query(
      `INSERT INTO coupons (code, discount_percent, expiry_date, usage_limit, usage_count, min_booking_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [c.code, c.discountPercent, c.expiryDate, c.usageLimit || 100, c.usageCount || 0, c.minBookingAmount || 0, c.status || 'active']
    );
    res.status(201).json({ message: 'Coupon added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/coupons/:code', async (req, res) => {
  try {
    await updateRecord('coupons', 'code', req.params.code, req.body, couponsKeyMap);
    res.json({ message: 'Coupon updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE code = $1', [req.params.code]);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USERS
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows.map(mapUserRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE uid = $1', [req.params.uid]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    await pool.query(
      `INSERT INTO users (uid, name, email, phone, photo_url, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, photo_url = EXCLUDED.photo_url`,
      [u.uid, u.name, u.email, u.phone, u.photoURL, u.role || 'user', u.createdAt || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ message: 'User synchronized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    await updateRecord('users', 'uid', req.params.uid, req.body, usersKeyMap);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(result.rows.map(mapBookingRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    await pool.query(
      `INSERT INTO bookings (booking_id, hotel_id, hotel_name, user_id, user_name, user_email, user_phone, room_type, check_in, check_out, guests, rooms_count, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        b.bookingId, b.hotelId, b.hotelName, b.userId, b.guestName || b.userName, b.userEmail, b.guestPhone || b.userPhone,
        b.roomType, b.checkIn, b.checkOut, b.guestsRooms || b.guests, b.roomsCount || 1, b.amount || b.totalPrice || 0, b.status || 'pending'
      ]
    );
    res.status(201).json({ message: 'Booking created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const updates = req.body;
    await updateRecord('bookings', 'booking_id', req.params.id, updates, bookingsKeyMap);
    res.json({ message: 'Booking updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE booking_id = $1', [req.params.id]);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REVIEWS
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.rows.map(mapReviewRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const r = req.body;
    await pool.query(
      `INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, reply_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [r.reviewId, r.hotelId, r.hotelName, r.userId, r.userName, r.userPhoto, r.rating, r.comment, r.replyText || '', r.status || 'pending']
    );
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function recalculateRating(hotelId) {
  try {
    const result = await pool.query('SELECT rating FROM reviews WHERE hotel_id = $1 AND status = \'approved\'', [hotelId]);
    const reviews = result.rows;
    const count = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = count > 0 ? parseFloat((ratingSum / count).toFixed(1)) : 4.5;
    await pool.query('UPDATE hotels SET rating = $1, reviews_count = $2 WHERE id = $3', [average, count, hotelId]);
  } catch (err) {
    console.error('Failed to recalculate rating for hotel:', hotelId, err);
  }
}

app.put('/api/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE reviews SET status = $1 WHERE review_id = $2', [status, req.params.id]);
    
    // Get hotelId to recalculate
    const reviewResult = await pool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
    if (reviewResult.rows.length > 0) {
      await recalculateRating(reviewResult.rows[0].hotel_id);
    }
    
    res.json({ message: 'Review status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    await pool.query('UPDATE reviews SET reply_text = $1 WHERE review_id = $2', [replyText, req.params.id]);
    res.json({ message: 'Review reply updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    // Get hotelId to recalculate before deleting
    const reviewResult = await pool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
    await pool.query('DELETE FROM reviews WHERE review_id = $1', [req.params.id]);
    if (reviewResult.rows.length > 0) {
      await recalculateRating(reviewResult.rows[0].hotel_id);
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SYSTEM USERS
app.get('/api/system-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM system_users');
    res.json(result.rows.map(mapSystemUserRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/system-users', async (req, res) => {
  try {
    const u = req.body;
    await pool.query(
      `INSERT INTO system_users (id, email, name, role, permissions, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [u.id, u.email, u.name, u.role, u.permissions, u.status || 'Active']
    );
    res.status(201).json({ message: 'System user added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/system-users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM system_users WHERE id = $1', [req.params.id]);
    res.json({ message: 'System user deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUDIT LOGS
app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(result.rows.map(mapAuditLogRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit_logs', async (req, res) => {
  try {
    const log = req.body;
    await pool.query(
      `INSERT INTO audit_logs (log_id, operator_id, operator_email, action, target_type, target_id, previous_value, new_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [log.logId, log.operatorId, log.operatorEmail, log.action, log.targetType, log.targetId, log.previousValue, log.newValue]
    );
    res.status(201).json({ message: 'Audit log created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FAVORITES
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows.map(mapFavoriteRow));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const fav = req.body;
    await pool.query(
      `INSERT INTO favorites (id, user_id, hotel_id) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [fav.id, fav.userId, fav.hotelId]
    );
    res.status(201).json({ message: 'Favorite added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites/:userId/:hotelId', async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE user_id = $1 AND hotel_id = $2', [req.params.userId, req.params.hotelId]);
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AUTHENTICATION ROUTES ───────────────────────────────────────────────
// Note: We use SHA-256 (via Node's native crypto module) to hash passwords cleanly

import crypto from 'crypto';

function hashPassword(password) {
  if (!password) return null;
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 'auth/invalid-email', message: 'Email and password required' });
    }

    const checkResult = await pool.query('SELECT uid FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ code: 'auth/email-already-in-use', message: 'Email already exists' });
    }

    const uid = 'usr_' + Date.now();
    const name = email.split('@')[0];
    const hashedPassword = hashPassword(password);
    const createdAt = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO users (uid, name, email, role, password, created_at, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING uid, name, email, role, created_at`,
      [uid, name, email, 'user', hashedPassword, createdAt, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80']
    );

    res.status(201).json(mapUserRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 'auth/invalid-credential', message: 'Email and password required' });
    }

    // Special hardcoded admin credentials from standard settings
    if ((email === 'admin' || email === 'admin@hotelsnearme.com') && password === '987654321') {
      const adminUser = {
        uid: 'sys_admin',
        name: 'Super Admin',
        email: 'admin@hotelsnearme.com',
        phone: '+91 9876 543 210',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        role: 'admin',
        created_at: '2026-06-21'
      };
      // Upsert admin record in the DB just to keep in sync
      await pool.query(
        `INSERT INTO users (uid, name, email, role, password, created_at, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role`,
        [adminUser.uid, adminUser.name, adminUser.email, adminUser.role, hashPassword(password), adminUser.created_at, adminUser.photo_url]
      );
      return res.json(mapUserRow(adminUser));
    }

    const hashedPassword = hashPassword(password);
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email' });
    }

    const user = result.rows[0];
    if (user.password !== hashedPassword) {
      return res.status(401).json({ code: 'auth/wrong-password', message: 'Incorrect password. Please try again.' });
    }

    res.json(mapUserRow(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    // Check if user exists, otherwise create
    const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      // Update details
      await pool.query(
        'UPDATE users SET name = $1, photo_url = $2 WHERE email = $3',
        [displayName, photoURL, email]
      );
      user.name = displayName;
      user.photo_url = photoURL;
      return res.json(mapUserRow(user));
    }

    const createdAt = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `INSERT INTO users (uid, name, email, role, photo_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uid, displayName, email, 'user', photoURL, createdAt]
    );

    res.status(201).json(mapUserRow(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const checkResult = await pool.query('SELECT uid FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email.' });
    }
    // Success response simulated
    res.json({ message: 'Password reset email simulation sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
