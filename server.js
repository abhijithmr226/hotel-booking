import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { localDbPool } from './localDb.js';
import { createClient } from '@supabase/supabase-js';
import ImageKit from 'imagekit';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Dynamic database fallback state
let useLocalDb = !process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || process.env.SUPABASE_URL.includes('[YOUR-');
if (useLocalDb) {
  console.log('⚠️ No valid Supabase credentials found. Using local JSON database (localDb.js) fallback...');
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = useLocalDb ? null : createClient(supabaseUrl, supabaseKey);

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

function isSupabaseError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('api') || msg.includes('connection');
}

// Mock pool.query for safety/fallback compatibility
const pool = {
  query: async function(sql, params) {
    return localDbPool.query(sql, params);
  }
};

// Test connection and verify schema on startup
if (!useLocalDb && supabase) {
  (async () => {
    try {
      const { data, error } = await supabase.from('hotels').select('id').limit(1);
      if (error) throw error;
      console.log('✅ Supabase connected and database tables verified.');
    } catch (err) {
      console.warn('⚠️ Supabase connection failed. Dynamic fallback to local JSON database:', err.message);
      useLocalDb = true;
    }
  })();
}


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

const VALID_COLUMNS = {
  hotels: [
    'id', 'name', 'location', 'district', 'category', 'rating', 'reviews_count',
    'price', 'tax', 'image', 'images', 'map_url', 'whatsapp', 'distance',
    'badge', 'description', 'amenities', 'highlights', 'details', 'nearby',
    'featured', 'trending', 'status', 'created_at'
  ],
  rooms: [
    'id', 'hotel_id', 'hotel_name', 'room_number', 'type', 'capacity',
    'price', 'beds', 'availability', 'amenities', 'inventory'
  ],
  coupons: [
    'code', 'discount_percent', 'expiry_date', 'usage_limit', 'usage_count',
    'min_booking_amount', 'status'
  ],
  users: [
    'uid', 'name', 'email', 'phone', 'photo_url', 'role', 'password', 'created_at'
  ],
  bookings: [
    'booking_id', 'hotel_id', 'hotel_name', 'user_id', 'user_name', 'user_email',
    'user_phone', 'room_type', 'check_in', 'check_out', 'guests', 'rooms_count',
    'total_price', 'status', 'created_at'
  ],
  reviews: [
    'review_id', 'hotel_id', 'hotel_name', 'user_id', 'user_name', 'user_photo',
    'rating', 'comment', 'reply_text', 'status', 'created_at'
  ],
  favorites: [
    'id', 'user_id', 'hotel_id', 'created_at'
  ]
};

// ─── Dynamic UPDATE statement generator ────────────────────────────────────
async function updateSupabaseRecord(table, idColumn, idValue, updates, keyMap) {
  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const allowed = VALID_COLUMNS[table];
  if (!allowed) {
    throw new Error(`Security Exception: No whitelist defined for table '${table}'`);
  }

  const dbUpdates = {};
  for (const key of keys) {
    const dbKey = keyMap[key] || key;

    // Strict whitelist check
    if (!allowed.includes(dbKey)) {
      throw new Error(`Security Exception: Invalid column '${dbKey}' for table '${table}'`);
    }

    dbUpdates[dbKey] = updates[key];
  }

  const { error } = await supabase
    .from(table)
    .update(dbUpdates)
    .eq(idColumn, idValue);

  if (error) {
    throw error;
  }
}

async function updateRecord(table, idColumn, idValue, updates, keyMap) {
  if (useLocalDb) {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const allowed = VALID_COLUMNS[table];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    for (const key of keys) {
      const dbKey = keyMap[key] || key;
      if (!allowed.includes(dbKey)) {
        throw new Error(`Security Exception: Invalid column '${dbKey}' for table '${table}'`);
      }
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
    await localDbPool.query(query, values);
    return;
  }

  try {
    await updateSupabaseRecord(table, idColumn, idValue, updates, keyMap);
  } catch (err) {
    if (isSupabaseError(err)) {
      console.warn(`⚠️ Supabase update failed. Dynamic fallback to local JSON database:`, err.message);
      useLocalDb = true;
      await updateRecord(table, idColumn, idValue, updates, keyMap);
    } else {
      throw err;
    }
  }
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

// IMAGEKIT UPLOAD API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname || `upload_${Date.now()}.png`,
      folder: '/kerala_hotels',
      useUniqueFileName: true
    });
    
    res.status(200).json({
      url: result.url,
      fileId: result.fileId,
      name: result.name
    });
  } catch (err) {
    console.error('ImageKit upload error:', err.message);
    res.status(500).json({ error: err.message || 'ImageKit upload failed' });
  }
});

// CONFIG / SETTINGS
app.get('/api/config/:key', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT value FROM config WHERE key = $1', [req.params.key]);
      if (result.rows.length === 0) return res.json({});
      return res.json(result.rows[0].value);
    }
    const { data, error } = await supabase.from('config').select('value').eq('key', req.params.key).maybeSingle();
    if (error) throw error;
    res.json(data ? data.value : {});
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT value FROM config WHERE key = $1', [req.params.key]);
      if (result.rows.length === 0) return res.json({});
      return res.json(result.rows[0].value);
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config/:key', async (req, res) => {
  try {
    if (useLocalDb) {
      const val = JSON.stringify(req.body);
      await localDbPool.query(
        'INSERT INTO config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [req.params.key, val]
      );
      return res.json({ message: 'Config updated' });
    }
    const { error } = await supabase.from('config').upsert({ key: req.params.key, value: req.body });
    if (error) throw error;
    res.json({ message: 'Config updated' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const val = JSON.stringify(req.body);
      await localDbPool.query(
        'INSERT INTO config (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [req.params.key, val]
      );
      return res.json({ message: 'Config updated' });
    }
    res.status(500).json({ error: err.message });
  }
});

// HOTELS
app.get('/api/hotels', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM hotels ORDER BY name ASC');
      return res.json(result.rows.map(mapHotelRow));
    }
    const { data, error } = await supabase.from('hotels').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json(data.map(mapHotelRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM hotels ORDER BY name ASC');
      return res.json(result.rows.map(mapHotelRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const h = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, images, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21, $22, $23)`,
        [
          h.id, h.name, h.location, h.district, h.category, h.rating || 4.5, h.reviewsCount || 0, h.price, h.tax, h.image,
          JSON.stringify(h.images || []), h.mapUrl || '', h.whatsapp, h.distance || '', h.badge || 'Newly Added', h.description,
          JSON.stringify(h.amenities || []), JSON.stringify(h.highlights || []),
          JSON.stringify(h.details || {}), JSON.stringify(h.nearby || []), h.featured || false, h.trending || false, h.status || 'active'
        ]
      );
      return res.status(201).json({ message: 'Hotel added' });
    }
    const { error } = await supabase.from('hotels').insert({
      id: h.id,
      name: h.name,
      location: h.location,
      district: h.district,
      category: h.category,
      rating: h.rating || 4.5,
      reviews_count: h.reviewsCount || 0,
      price: h.price,
      tax: h.tax,
      image: h.image,
      images: h.images || [],
      map_url: h.mapUrl || '',
      whatsapp: h.whatsapp,
      distance: h.distance || '',
      badge: h.badge || 'Newly Added',
      description: h.description,
      amenities: h.amenities || [],
      highlights: h.highlights || [],
      details: h.details || {},
      nearby: h.nearby || [],
      featured: h.featured || false,
      trending: h.trending || false,
      status: h.status || 'active'
    });
    if (error) throw error;
    res.status(201).json({ message: 'Hotel added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const h = req.body;
      await localDbPool.query(
        `INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, images, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21, $22, $23)`,
        [
          h.id, h.name, h.location, h.district, h.category, h.rating || 4.5, h.reviewsCount || 0, h.price, h.tax, h.image,
          JSON.stringify(h.images || []), h.mapUrl || '', h.whatsapp, h.distance || '', h.badge || 'Newly Added', h.description,
          JSON.stringify(h.amenities || []), JSON.stringify(h.highlights || []),
          JSON.stringify(h.details || {}), JSON.stringify(h.nearby || []), h.featured || false, h.trending || false, h.status || 'active'
        ]
      );
      return res.status(201).json({ message: 'Hotel added' });
    }
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
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);
      return res.json({ message: 'Hotel deleted' });
    }
    const { error } = await supabase.from('hotels').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);
      return res.json({ message: 'Hotel deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ROOMS
app.get('/api/rooms', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM rooms');
      return res.json(result.rows.map(mapRoomRow));
    }
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    res.json(data.map(mapRoomRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM rooms');
      return res.json(result.rows.map(mapRoomRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const r = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO rooms (id, hotel_id, hotel_name, room_number, type, capacity, price, beds, availability, amenities, inventory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
        [r.id, r.hotelId, r.hotelName, r.roomNumber, r.type, r.capacity, r.price, r.beds, r.availability || 'available', JSON.stringify(r.amenities || []), r.inventory]
      );
      return res.status(201).json({ message: 'Room added' });
    }
    const { error } = await supabase.from('rooms').insert({
      id: r.id,
      hotel_id: r.hotelId,
      hotel_name: r.hotelName,
      room_number: r.roomNumber,
      type: r.type,
      capacity: r.capacity,
      price: r.price,
      beds: r.beds,
      availability: r.availability || 'available',
      amenities: r.amenities || [],
      inventory: r.inventory
    });
    if (error) throw error;
    res.status(201).json({ message: 'Room added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const r = req.body;
      await localDbPool.query(
        `INSERT INTO rooms (id, hotel_id, hotel_name, room_number, type, capacity, price, beds, availability, amenities, inventory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
        [r.id, r.hotelId, r.hotelName, r.roomNumber, r.type, r.capacity, r.price, r.beds, r.availability || 'available', JSON.stringify(r.amenities || []), r.inventory]
      );
      return res.status(201).json({ message: 'Room added' });
    }
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
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
      return res.json({ message: 'Room deleted' });
    }
    const { error } = await supabase.from('rooms').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Room deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
      return res.json({ message: 'Room deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// COUPONS
app.get('/api/coupons', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM coupons');
      return res.json(result.rows.map(mapCouponRow));
    }
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) throw error;
    res.json(data.map(mapCouponRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM coupons');
      return res.json(result.rows.map(mapCouponRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const c = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO coupons (code, discount_percent, expiry_date, usage_limit, usage_count, min_booking_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.code, c.discountPercent, c.expiryDate, c.usageLimit || 100, c.usageCount || 0, c.minBookingAmount || 0, c.status || 'active']
      );
      return res.status(201).json({ message: 'Coupon added' });
    }
    const { error } = await supabase.from('coupons').insert({
      code: c.code,
      discount_percent: c.discountPercent,
      expiry_date: c.expiryDate,
      usage_limit: c.usageLimit || 100,
      usage_count: c.usageCount || 0,
      min_booking_amount: c.minBookingAmount || 0,
      status: c.status || 'active'
    });
    if (error) throw error;
    res.status(201).json({ message: 'Coupon added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const c = req.body;
      await localDbPool.query(
        `INSERT INTO coupons (code, discount_percent, expiry_date, usage_limit, usage_count, min_booking_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.code, c.discountPercent, c.expiryDate, c.usageLimit || 100, c.usageCount || 0, c.minBookingAmount || 0, c.status || 'active']
      );
      return res.status(201).json({ message: 'Coupon added' });
    }
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
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM coupons WHERE code = $1', [req.params.code]);
      return res.json({ message: 'Coupon deleted' });
    }
    const { error } = await supabase.from('coupons').delete().eq('code', req.params.code);
    if (error) throw error;
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM coupons WHERE code = $1', [req.params.code]);
      return res.json({ message: 'Coupon deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// USERS
app.get('/api/users', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM users');
      return res.json(result.rows.map(mapUserRow));
    }
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data.map(mapUserRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM users');
      return res.json(result.rows.map(mapUserRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM users WHERE uid = $1', [req.params.uid]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json(mapUserRow(result.rows[0]));
    }
    const { data, error } = await supabase.from('users').select('*').eq('uid', req.params.uid).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(mapUserRow(data));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM users WHERE uid = $1', [req.params.uid]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json(mapUserRow(result.rows[0]));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO users (uid, name, email, phone, photo_url, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, photo_url = EXCLUDED.photo_url`,
        [u.uid, u.name, u.email, u.phone, u.photoURL, u.role || 'user', u.createdAt || new Date().toISOString().split('T')[0]]
      );
      return res.status(201).json({ message: 'User synchronized' });
    }
    const { error } = await supabase.from('users').upsert({
      uid: u.uid,
      name: u.name,
      email: u.email,
      phone: u.phone,
      photo_url: u.photoURL,
      role: u.role || 'user',
      created_at: u.createdAt || new Date().toISOString().split('T')[0]
    }, { onConflict: 'uid' });
    if (error) throw error;
    res.status(201).json({ message: 'User synchronized' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const u = req.body;
      await localDbPool.query(
        `INSERT INTO users (uid, name, email, phone, photo_url, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, photo_url = EXCLUDED.photo_url`,
        [u.uid, u.name, u.email, u.phone, u.photoURL, u.role || 'user', u.createdAt || new Date().toISOString().split('T')[0]]
      );
      return res.status(201).json({ message: 'User synchronized' });
    }
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
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return res.json(result.rows.map(mapBookingRow));
    }
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapBookingRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return res.json(result.rows.map(mapBookingRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO bookings (booking_id, hotel_id, hotel_name, user_id, user_name, user_email, user_phone, room_type, check_in, check_out, guests, rooms_count, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          b.bookingId, b.hotelId, b.hotelName, b.userId, b.guestName || b.userName, b.userEmail, b.guestPhone || b.userPhone,
          b.roomType, b.checkIn, b.checkOut, b.guestsRooms || b.guests, b.roomsCount || 1, b.amount || b.totalPrice || 0, b.status || 'pending'
        ]
      );
      return res.status(201).json({ message: 'Booking created' });
    }
    const { error } = await supabase.from('bookings').insert({
      booking_id: b.bookingId,
      hotel_id: b.hotelId,
      hotel_name: b.hotelName,
      user_id: b.userId,
      user_name: b.guestName || b.userName,
      user_email: b.userEmail,
      user_phone: b.guestPhone || b.userPhone,
      room_type: b.roomType,
      check_in: b.checkIn,
      check_out: b.checkOut,
      guests: b.guestsRooms || b.guests,
      rooms_count: b.roomsCount || 1,
      total_price: b.amount || b.totalPrice || 0,
      status: b.status || 'pending'
    });
    if (error) throw error;
    res.status(201).json({ message: 'Booking created' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const b = req.body;
      await localDbPool.query(
        `INSERT INTO bookings (booking_id, hotel_id, hotel_name, user_id, user_name, user_email, user_phone, room_type, check_in, check_out, guests, rooms_count, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          b.bookingId, b.hotelId, b.hotelName, b.userId, b.guestName || b.userName, b.userEmail, b.guestPhone || b.userPhone,
          b.roomType, b.checkIn, b.checkOut, b.guestsRooms || b.guests, b.roomsCount || 1, b.amount || b.totalPrice || 0, b.status || 'pending'
        ]
      );
      return res.status(201).json({ message: 'Booking created' });
    }
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
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM bookings WHERE booking_id = $1', [req.params.id]);
      return res.json({ message: 'Booking deleted' });
    }
    const { error } = await supabase.from('bookings').delete().eq('booking_id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM bookings WHERE booking_id = $1', [req.params.id]);
      return res.json({ message: 'Booking deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// REVIEWS
app.get('/api/reviews', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      return res.json(result.rows.map(mapReviewRow));
    }
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapReviewRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      return res.json(result.rows.map(mapReviewRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const r = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, reply_text, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [r.reviewId, r.hotelId, r.hotelName, r.userId, r.userName, r.userPhoto, r.rating, r.comment, r.replyText || '', r.status || 'pending']
      );
      return res.status(201).json({ message: 'Review added' });
    }
    const { error } = await supabase.from('reviews').insert({
      review_id: r.reviewId,
      hotel_id: r.hotelId,
      hotel_name: r.hotelName,
      user_id: r.userId,
      user_name: r.userName,
      user_photo: r.userPhoto,
      rating: r.rating,
      comment: r.comment,
      reply_text: r.replyText || '',
      status: r.status || 'pending'
    });
    if (error) throw error;
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const r = req.body;
      await localDbPool.query(
        `INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, reply_text, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [r.reviewId, r.hotelId, r.hotelName, r.userId, r.userName, r.userPhoto, r.rating, r.comment, r.replyText || '', r.status || 'pending']
      );
      return res.status(201).json({ message: 'Review added' });
    }
    res.status(500).json({ error: err.message });
  }
});

async function recalculateRating(hotelId) {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT rating FROM reviews WHERE hotel_id = $1 AND status = \'approved\'', [hotelId]);
      const reviews = result.rows;
      const count = reviews.length;
      const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
      const average = count > 0 ? parseFloat((ratingSum / count).toFixed(1)) : 4.5;
      await localDbPool.query('UPDATE hotels SET rating = $1, reviews_count = $2 WHERE id = $3', [average, count, hotelId]);
      return;
    }

    const { data: reviews, error: fetchErr } = await supabase
      .from('reviews')
      .select('rating')
      .eq('hotel_id', hotelId)
      .eq('status', 'approved');
      
    if (fetchErr) throw fetchErr;
    const count = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = count > 0 ? parseFloat((ratingSum / count).toFixed(1)) : 4.5;
    
    const { error: updateErr } = await supabase
      .from('hotels')
      .update({ rating: average, reviews_count: count })
      .eq('id', hotelId);
      
    if (updateErr) throw updateErr;
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await recalculateRating(hotelId);
    } else {
      console.error('Failed to recalculate rating for hotel:', hotelId, err);
    }
  }
}

app.put('/api/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (useLocalDb) {
      await localDbPool.query('UPDATE reviews SET status = $1 WHERE review_id = $2', [status, req.params.id]);
      const reviewResult = await localDbPool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
      if (reviewResult.rows.length > 0) {
        await recalculateRating(reviewResult.rows[0].hotel_id);
      }
      return res.json({ message: 'Review status updated' });
    }

    const { error: updateErr } = await supabase.from('reviews').update({ status }).eq('review_id', req.params.id);
    if (updateErr) throw updateErr;
    
    const { data: review, error: rErr } = await supabase.from('reviews').select('hotel_id').eq('review_id', req.params.id).maybeSingle();
    if (review) {
      await recalculateRating(review.hotel_id);
    }
    
    res.json({ message: 'Review status updated' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const { status } = req.body;
      await localDbPool.query('UPDATE reviews SET status = $1 WHERE review_id = $2', [status, req.params.id]);
      const reviewResult = await localDbPool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
      if (reviewResult.rows.length > 0) {
        await recalculateRating(reviewResult.rows[0].hotel_id);
      }
      return res.json({ message: 'Review status updated' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    if (useLocalDb) {
      await localDbPool.query('UPDATE reviews SET reply_text = $1 WHERE review_id = $2', [replyText, req.params.id]);
      return res.json({ message: 'Review reply updated' });
    }
    const { error } = await supabase.from('reviews').update({ reply_text: replyText }).eq('review_id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Review reply updated' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const { replyText } = req.body;
      await localDbPool.query('UPDATE reviews SET reply_text = $1 WHERE review_id = $2', [replyText, req.params.id]);
      return res.json({ message: 'Review reply updated' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    if (useLocalDb) {
      const reviewResult = await localDbPool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
      await localDbPool.query('DELETE FROM reviews WHERE review_id = $1', [req.params.id]);
      if (reviewResult.rows.length > 0) {
        await recalculateRating(reviewResult.rows[0].hotel_id);
      }
      return res.json({ message: 'Review deleted' });
    }

    const { data: review, error: rErr } = await supabase.from('reviews').select('hotel_id').eq('review_id', req.params.id).maybeSingle();
    const { error: delErr } = await supabase.from('reviews').delete().eq('review_id', req.params.id);
    if (delErr) throw delErr;
    if (review) {
      await recalculateRating(review.hotel_id);
    }
    res.json({ message: 'Review deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const reviewResult = await localDbPool.query('SELECT hotel_id FROM reviews WHERE review_id = $1', [req.params.id]);
      await localDbPool.query('DELETE FROM reviews WHERE review_id = $1', [req.params.id]);
      if (reviewResult.rows.length > 0) {
        await recalculateRating(reviewResult.rows[0].hotel_id);
      }
      return res.json({ message: 'Review deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// SYSTEM USERS
app.get(['/api/system-users', '/api/system_users'], async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM system_users');
      return res.json(result.rows.map(mapSystemUserRow));
    }
    const { data, error } = await supabase.from('system_users').select('*');
    if (error) throw error;
    res.json(data.map(mapSystemUserRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM system_users');
      return res.json(result.rows.map(mapSystemUserRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/system-users', '/api/system_users'], async (req, res) => {
  try {
    const u = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO system_users (id, email, name, role, permissions, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.id, u.email, u.name, u.role, u.permissions, u.status || 'Active']
      );
      return res.status(201).json({ message: 'System user added' });
    }
    const { error } = await supabase.from('system_users').insert({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      permissions: u.permissions,
      status: u.status || 'Active'
    });
    if (error) throw error;
    res.status(201).json({ message: 'System user added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const u = req.body;
      await localDbPool.query(
        `INSERT INTO system_users (id, email, name, role, permissions, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.id, u.email, u.name, u.role, u.permissions, u.status || 'Active']
      );
      return res.status(201).json({ message: 'System user added' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete(['/api/system-users/:id', '/api/system_users/:id'], async (req, res) => {
  try {
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM system_users WHERE id = $1', [req.params.id]);
      return res.json({ message: 'System user deleted' });
    }
    const { error } = await supabase.from('system_users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'System user deleted' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM system_users WHERE id = $1', [req.params.id]);
      return res.json({ message: 'System user deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

// AUDIT LOGS
app.get(['/api/audit-logs', '/api/audit_logs'], async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
      return res.json(result.rows.map(mapAuditLogRow));
    }
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(data.map(mapAuditLogRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
      return res.json(result.rows.map(mapAuditLogRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/audit-logs', '/api/audit_logs'], async (req, res) => {
  try {
    const log = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO audit_logs (log_id, operator_id, operator_email, action, target_type, target_id, previous_value, new_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [log.logId, log.operatorId, log.operatorEmail, log.action, log.targetType, log.targetId, log.previousValue, log.newValue]
      );
      return res.status(201).json({ message: 'Audit log created' });
    }
    const { error } = await supabase.from('audit_logs').insert({
      log_id: log.logId,
      operator_id: log.operatorId,
      operator_email: log.operatorEmail,
      action: log.action,
      target_type: log.targetType,
      target_id: log.targetId,
      previous_value: log.previousValue,
      new_value: log.newValue
    });
    if (error) throw error;
    res.status(201).json({ message: 'Audit log created' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const log = req.body;
      await localDbPool.query(
        `INSERT INTO audit_logs (log_id, operator_id, operator_email, action, target_type, target_id, previous_value, new_value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [log.logId, log.operatorId, log.operatorEmail, log.action, log.targetType, log.targetId, log.previousValue, log.newValue]
      );
      return res.status(201).json({ message: 'Audit log created' });
    }
    res.status(500).json({ error: err.message });
  }
});

// FAVORITES
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM favorites WHERE user_id = $1', [req.params.userId]);
      return res.json(result.rows.map(mapFavoriteRow));
    }
    const { data, error } = await supabase.from('favorites').select('*').eq('user_id', req.params.userId);
    if (error) throw error;
    res.json(data.map(mapFavoriteRow));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const result = await localDbPool.query('SELECT * FROM favorites WHERE user_id = $1', [req.params.userId]);
      return res.json(result.rows.map(mapFavoriteRow));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const fav = req.body;
    if (useLocalDb) {
      await localDbPool.query(
        `INSERT INTO favorites (id, user_id, hotel_id) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [fav.id, fav.userId, fav.hotelId]
      );
      return res.status(201).json({ message: 'Favorite added' });
    }
    const { error } = await supabase.from('favorites').insert({
      id: fav.id,
      user_id: fav.userId,
      hotel_id: fav.hotelId
    });
    if (error) throw error;
    res.status(201).json({ message: 'Favorite added' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const fav = req.body;
      await localDbPool.query(
        `INSERT INTO favorites (id, user_id, hotel_id) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [fav.id, fav.userId, fav.hotelId]
      );
      return res.status(201).json({ message: 'Favorite added' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites/:userId/:hotelId', async (req, res) => {
  try {
    if (useLocalDb) {
      await localDbPool.query('DELETE FROM favorites WHERE user_id = $1 AND hotel_id = $2', [req.params.userId, req.params.hotelId]);
      return res.json({ message: 'Favorite removed' });
    }
    const { error } = await supabase.from('favorites').delete().eq('user_id', req.params.userId).eq('hotel_id', req.params.hotelId);
    if (error) throw error;
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      await localDbPool.query('DELETE FROM favorites WHERE user_id = $1 AND hotel_id = $2', [req.params.userId, req.params.hotelId]);
      return res.json({ message: 'Favorite removed' });
    }
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

    if (useLocalDb) {
      const checkResult = await localDbPool.query('SELECT uid FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length > 0) {
        return res.status(409).json({ code: 'auth/email-already-in-use', message: 'Email already exists' });
      }
      const uid = 'usr_' + Date.now();
      const name = email.split('@')[0];
      const hashedPassword = hashPassword(password);
      const createdAt = new Date().toISOString().split('T')[0];
      const result = await localDbPool.query(
        `INSERT INTO users (uid, name, email, role, password, created_at, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING uid, name, email, role, created_at`,
        [uid, name, email, 'user', hashedPassword, createdAt, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80']
      );
      return res.status(201).json(mapUserRow(result.rows[0]));
    }

    const { data: checkUsers, error: checkErr } = await supabase.from('users').select('uid').eq('email', email);
    if (checkErr) throw checkErr;
    if (checkUsers && checkUsers.length > 0) {
      return res.status(409).json({ code: 'auth/email-already-in-use', message: 'Email already exists' });
    }

    const uid = 'usr_' + Date.now();
    const name = email.split('@')[0];
    const hashedPassword = hashPassword(password);
    const createdAt = new Date().toISOString().split('T')[0];

    const { data: newUser, error: insErr } = await supabase.from('users').insert({
      uid,
      name,
      email,
      role: 'user',
      password: hashedPassword,
      created_at: createdAt,
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
    }).select('uid, name, email, role, created_at').single();

    if (insErr) throw insErr;
    res.status(201).json(mapUserRow(newUser));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const { email, password } = req.body;
      const checkResult = await localDbPool.query('SELECT uid FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length > 0) {
        return res.status(409).json({ code: 'auth/email-already-in-use', message: 'Email already exists' });
      }
      const uid = 'usr_' + Date.now();
      const name = email.split('@')[0];
      const hashedPassword = hashPassword(password);
      const createdAt = new Date().toISOString().split('T')[0];
      const result = await localDbPool.query(
        `INSERT INTO users (uid, name, email, role, password, created_at, photo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING uid, name, email, role, created_at`,
        [uid, name, email, 'user', hashedPassword, createdAt, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80']
      );
      return res.status(201).json(mapUserRow(result.rows[0]));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 'auth/invalid-credential', message: 'Email and password required' });
    }

    // Special hardcoded admin credentials
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'directrajeev@gmail.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aabb..1122';
    const isAdmin = (email === ADMIN_EMAIL || email === 'admin' || email === 'admin@hotelsnearme.com')
                 && (password === ADMIN_PASSWORD || password === '987654321');
    if (isAdmin) {
      const adminUser = {
        uid: 'sys_admin',
        name: 'Admin',
        email: ADMIN_EMAIL,
        phone: '+91 9876 543 210',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
        role: 'admin',
        created_at: '2026-06-21'
      };
      // Upsert admin record in the DB just to keep in sync
      try {
        if (useLocalDb) {
          await localDbPool.query(
            `INSERT INTO users (uid, name, email, role, password, created_at, photo_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role`,
            [adminUser.uid, adminUser.name, adminUser.email, adminUser.role, hashPassword(password), adminUser.created_at, adminUser.photo_url]
          );
        } else {
          await supabase.from('users').upsert({
            uid: adminUser.uid,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            password: hashPassword(password),
            created_at: adminUser.created_at,
            photo_url: adminUser.photo_url
          }, { onConflict: 'uid' });
        }
      } catch (dbErr) {
        console.warn("DB offline, skipping admin sync:", dbErr.message);
      }
      return res.json(mapUserRow(adminUser));
    }

    const hashedPassword = hashPassword(password);
    
    if (useLocalDb) {
      const result = await localDbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email' });
      }
      const user = result.rows[0];
      if (user.password !== hashedPassword) {
        return res.status(401).json({ code: 'auth/wrong-password', message: 'Incorrect password. Please try again.' });
      }
      return res.json(mapUserRow(user));
    }

    const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email' });
    }
    const user = users[0];
    if (user.password !== hashedPassword) {
      return res.status(401).json({ code: 'auth/wrong-password', message: 'Incorrect password. Please try again.' });
    }
    res.json(mapUserRow(user));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const { email, password } = req.body;
      const hashedPassword = hashPassword(password);
      const result = await localDbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email' });
      }
      const user = result.rows[0];
      if (user.password !== hashedPassword) {
        return res.status(401).json({ code: 'auth/wrong-password', message: 'Incorrect password. Please try again.' });
      }
      return res.json(mapUserRow(user));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    if (useLocalDb) {
      const checkResult = await localDbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length > 0) {
        const user = checkResult.rows[0];
        await localDbPool.query(
          'UPDATE users SET name = $1, photo_url = $2 WHERE email = $3',
          [displayName, photoURL, email]
        );
        user.name = displayName;
        user.photo_url = photoURL;
        return res.json(mapUserRow(user));
      }
      const createdAt = new Date().toISOString().split('T')[0];
      const result = await localDbPool.query(
        `INSERT INTO users (uid, name, email, role, photo_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [uid, displayName, email, 'user', photoURL, createdAt]
      );
      return res.status(201).json(mapUserRow(result.rows[0]));
    }

    const { data: users, error: checkErr } = await supabase.from('users').select('*').eq('email', email);
    if (checkErr) throw checkErr;
    if (users && users.length > 0) {
      const user = users[0];
      const { error: updErr } = await supabase.from('users').update({ name: displayName, photo_url: photoURL }).eq('email', email);
      if (updErr) throw updErr;
      user.name = displayName;
      user.photo_url = photoURL;
      return res.json(mapUserRow(user));
    }

    const createdAt = new Date().toISOString().split('T')[0];
    const { data: newUser, error: insErr } = await supabase.from('users').insert({
      uid,
      name: displayName,
      email,
      role: 'user',
      photo_url: photoURL,
      created_at: createdAt
    }).select('*').single();

    if (insErr) throw insErr;
    res.status(201).json(mapUserRow(newUser));
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const { uid, email, displayName, photoURL } = req.body;
      const checkResult = await localDbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length > 0) {
        const user = checkResult.rows[0];
        await localDbPool.query(
          'UPDATE users SET name = $1, photo_url = $2 WHERE email = $3',
          [displayName, photoURL, email]
        );
        user.name = displayName;
        user.photo_url = photoURL;
        return res.json(mapUserRow(user));
      }
      const createdAt = new Date().toISOString().split('T')[0];
      const result = await localDbPool.query(
        `INSERT INTO users (uid, name, email, role, photo_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [uid, displayName, email, 'user', photoURL, createdAt]
      );
      return res.status(201).json(mapUserRow(result.rows[0]));
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (useLocalDb) {
      const checkResult = await localDbPool.query('SELECT uid FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email.' });
      }
      return res.json({ message: 'Password reset email simulation sent.' });
    }

    const { data: users, error } = await supabase.from('users').select('uid').eq('email', email);
    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email.' });
    }
    res.json({ message: 'Password reset email simulation sent.' });
  } catch (err) {
    if (!useLocalDb && isSupabaseError(err)) {
      console.warn('⚠️ Supabase error. Fallback to local DB.');
      useLocalDb = true;
      const checkResult = await localDbPool.query('SELECT uid FROM users WHERE email = $1', [email]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ code: 'auth/user-not-found', message: 'No account found with this email.' });
      }
      return res.json({ message: 'Password reset email simulation sent.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets in production (Express Caching)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // Disable caching for HTML entry points to ensure instant updates
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        // Cache other assets (JS, CSS, images) for 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Catch-all route to support SPA/multi-page routing fallbacks
  app.get('*all', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// START SERVER
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
