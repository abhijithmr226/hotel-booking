-- schema.sql
-- Drop tables if they exist
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_users CASCADE;
DROP TABLE IF EXISTS config CASCADE;

-- Create tables
CREATE TABLE hotels (
    id VARCHAR(100) PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    district TEXT,
    category TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    map_url TEXT DEFAULT '',
    whatsapp TEXT,
    distance TEXT,
    badge TEXT,
    description TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    details JSONB DEFAULT '{}'::jsonb,
    nearby JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) REFERENCES hotels(id) ON DELETE CASCADE,
    hotel_name TEXT,
    room_number TEXT,
    type TEXT,
    capacity INTEGER DEFAULT 2,
    price INTEGER DEFAULT 0,
    beds INTEGER DEFAULT 1,
    availability TEXT DEFAULT 'available',
    amenities JSONB DEFAULT '[]'::jsonb,
    inventory INTEGER DEFAULT 1
);

CREATE TABLE coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_percent INTEGER DEFAULT 0,
    expiry_date DATE,
    usage_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    min_booking_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
);

CREATE TABLE users (
    uid VARCHAR(100) PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'user',
    password TEXT,
    created_at TEXT
);

CREATE TABLE bookings (
    booking_id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) REFERENCES hotels(id) ON DELETE SET NULL,
    hotel_name TEXT,
    user_id TEXT,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    room_type TEXT,
    check_in DATE,
    check_out DATE,
    guests TEXT,
    rooms_count INTEGER DEFAULT 1,
    total_price INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id VARCHAR(100) PRIMARY KEY,
    hotel_id VARCHAR(100) REFERENCES hotels(id) ON DELETE CASCADE,
    hotel_name TEXT,
    user_id TEXT,
    user_name TEXT,
    user_photo TEXT,
    rating INTEGER DEFAULT 5,
    comment TEXT,
    reply_text TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    log_id VARCHAR(100) PRIMARY KEY,
    operator_id TEXT,
    operator_email TEXT,
    action TEXT,
    target_type TEXT,
    target_id TEXT,
    previous_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_users (
    id VARCHAR(100) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT,
    permissions TEXT,
    status TEXT DEFAULT 'Active'
);

CREATE TABLE favorites (
    id VARCHAR(200) PRIMARY KEY,
    user_id TEXT NOT NULL,
    hotel_id VARCHAR(100) REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL
);


-- No seed data. Add hotels via the Admin Dashboard.
