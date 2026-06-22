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


-- ─── Sample Hotels Seed Data ───────────────────────────────────────────────
INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status) VALUES
('hotel-001','Kumarakom Lake Resort','Kumarakom, Kottayam','Kottayam','Luxury Resorts',4.9,1284,18500,18,'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Kumarakom+Lake+Resort','919876543210','150 km from Kochi','Top Rated','A breathtaking luxury resort on the banks of Vembanad Lake.','["Swimming Pool","Spa & Wellness","Backwater Cruise","Restaurant","Bar","Yoga Center","Ayurveda","Free WiFi","AC Rooms","Room Service"]','["Heritage villas on water","Private pool villas available","Sunset boat cruises","Award-winning Ayurveda spa"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Vembanad Lake","Kumarakom Bird Sanctuary","Bay Island Driftwood Museum"]',true,true,'active'),
('hotel-002','Taj Malabar Resort & Spa','Wellington Island, Kochi','Ernakulam','Luxury Resorts',4.8,2156,14200,18,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Taj+Malabar+Kochi','919876543211','5 km from Kochi Airport','Luxury','Positioned on Wellington Island overlooking the Arabian Sea.','["Sea View Rooms","Infinity Pool","Spa","Multiple Restaurants","Bar","Fitness Center","Tennis Court","Free WiFi","Concierge","Airport Transfer"]','["Harbour view rooms","Heritage building","Fine dining restaurants","Marina adjacent"]','{"checkIn":"3:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Fort Kochi","Chinese Fishing Nets","Mattancherry Palace","Jew Town"]',true,false,'active'),
('hotel-003','Spice Village Thekkady','Thekkady, Idukki','Idukki','Homestays',4.7,876,8900,12,'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Spice+Village+Thekkady','919876543212','4 km from Periyar Wildlife Sanctuary','Eco Stay','Award-winning eco-resort featuring traditional Kerala cottages amid spice plantations.','["Spice Plantation Walk","Ayurveda Treatments","Campfire","Restaurant","Yoga","Wildlife Safaris","Cultural Shows","Free WiFi"]','["Spice plantation walks","Periyar Tiger Reserve nearby","Authentic Kerala cuisine","Eco-certified property"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 72 hours before check-in"}','["Periyar Tiger Reserve","Kumily Spice Market","Mangaladevi Temple"]',true,true,'active'),
('hotel-004','Houseboat Delight Alleppey','Punnamada Lake, Alappuzha','Alappuzha','Houseboats',4.6,543,7500,12,'https://images.unsplash.com/photo-1593692909825-44b7b37a4d76?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Alleppey+Houseboat','919876543213','3 km from Alappuzha Town','Backwaters','A luxury AC houseboat cruising the serene backwaters of Alleppey.','["AC Bedrooms","Sun Deck","Private Crew","Full Board Meals","Village Tour","Canoe Ride","Fishing","Sunset Cruise"]','["2-bedroom luxury houseboat","Cruising the Vembanad Lake","All meals included","Village and paddy field views"]','{"checkIn":"12:00 PM","checkOut":"9:00 AM","breakfast":"Included (Full Board)","cancellation":"Free cancellation 48 hours before check-in"}','["Alappuzha Beach","Krishnapuram Palace","Marari Beach"]',true,true,'active'),
('hotel-005','Munnar Retreat','Devikulam, Munnar','Idukki','Hill Station Hotels',4.5,712,5800,12,'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Munnar+Tea+Garden','919876543214','8 km from Munnar Town','Scenic View','Perched at 5,000 feet above sea level with panoramic tea plantation views.','["Tea Plantation View","Fireplace","Restaurant","Tea Factory Visit","Trekking","Bird Watching","Free WiFi","Bonfire"]','["360 degree tea garden views","Tea factory guided tour","Cool climate year-round","Trekking trails nearby"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Eravikulam National Park","Mattupetty Dam","Anamudi Peak","Photo Point"]',false,true,'active'),
('hotel-006','Varkala Cliff Beach Resort','North Cliff, Varkala','Thiruvananthapuram','Beach Resorts',4.4,634,4200,12,'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Varkala+Cliff','919876543215','51 km from Thiruvananthapuram','Beachfront','Dramatic clifftop location with stunning views of the Arabian Sea.','["Cliffside Restaurant","Beach Access","Yoga Classes","Surfing Lessons","Infinity Pool","Spa","Free WiFi","Bonfire"]','["Cliff-edge sea views","Natural mineral spring on beach","Surfer-friendly beach","Authentic local restaurants nearby"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Varkala Beach","Janardhana Swami Temple","Black Beach","Sivagiri Mutt"]',false,false,'active'),
('hotel-007','Wayanad Green Magic','Vythiri, Wayanad','Wayanad','Homestays',4.8,421,6500,12,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Wayanad+Green+Magic','919876543216','15 km from Kalpetta','Nature Retreat','Extraordinary treehouse and jungle resort in the Wayanad rainforest.','["Treehouse Stay","Rope Bridges","Nature Walks","Tribal Village Tour","Waterfall Trek","Bird Watching","Campfire","Organic Meals"]','["90-foot high treehouse","Rope bridge adventures","Ancient tribal heritage tours","Banasura Sagar Dam nearby"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Chembra Peak","Banasura Sagar Dam","Edakkal Caves","Soochippara Waterfall"]',true,true,'active'),
('hotel-008','Kovalam Ashok Beach Resort','Lighthouse Beach, Kovalam','Thiruvananthapuram','Beach Resorts',4.3,987,9800,18,'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Kovalam+Lighthouse+Beach','919876543217','16 km from Thiruvananthapuram Airport','Beachfront','India''s premier beachside resort overlooks the famous crescent-shaped Lighthouse Beach.','["Private Beach","Infinity Pool","Ayurveda Center","Multi-cuisine Restaurant","Bar","Water Sports","Spa","Free WiFi","Fitness Center"]','["Crescent-shaped lighthouse beach","Lighthouse view from property","Award-winning Ayurveda treatments","Fresh catch seafood daily"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Kovalam Lighthouse","Vizhinjam Rock Cut Cave","Halcyon Castle","Padmanabhaswamy Temple"]',false,true,'active'),
('hotel-009','Fort House Hotel Kochi','Fort Kochi, Ernakulam','Ernakulam','Business Hotels',4.5,823,3800,12,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Fort+Kochi','919876543218','1 km from Fort Kochi','Heritage','A charming heritage boutique hotel in the heart of historic Fort Kochi.','["Waterfront Dining","Heritage Tours","Boat Jetty","Conference Room","Free WiFi","Cycling Tours","Cultural Activities","AC Rooms"]','["Colonial Dutch architecture","Chinese fishing nets walk away","Waterfront restaurant","Antique Kochi museum next door"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 24 hours before check-in"}','["Chinese Fishing Nets","St. Francis Church","Mattancherry Palace","Paradesi Synagogue"]',false,false,'active'),
('hotel-010','Thrissur Gateway Hotel','Sakthan Nagar, Thrissur','Thrissur','Business Hotels',4.2,512,2900,12,'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Thrissur+City+Center','919876543219','1 km from Thrissur Railway Station','City Center','A modern business hotel in the cultural capital of Kerala, Thrissur.','["Conference Halls","Restaurant","Bar","Room Service","Free WiFi","Parking","Laundry","AC Rooms","Business Center"]','["Thrissur Pooram festival hub","Near Vadakkumnathan Temple","Shopping district walking distance","Best Kerala sadya restaurant onsite"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Vadakkumnathan Temple","Thrissur Zoo","Archaeological Museum","Shakthan Thampuran Palace"]',false,false,'active'),
('hotel-011','Kalari Kovilakom Palace','Kollengode, Palakkad','Palakkad','Luxury Resorts',4.9,298,22000,18,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Kalari+Kovilakom+Palakkad','919876543220','75 km from Coimbatore Airport','Palace Stay','A 19th-century royal palace converted into an exclusive Ayurveda retreat.','["Ayurveda Palace","Doctor Consultation","Panchakarma","Yoga Hall","Meditation Garden","Organic Meals","Heritage Library","Nature Walks"]','["19th-century royal palace","Personalized Ayurveda programs","Resident Ayurvedic doctors","Organic farm-to-table meals"]','{"checkIn":"3:00 PM","checkOut":"11:00 AM","breakfast":"Included (Full Board)","cancellation":"Non-refundable"}','["Kollengode Palace Gardens","Silent Valley National Park","Malampuzha Dam","Nelliyampathy Hills"]',true,false,'active'),
('hotel-012','Marari Beach Resort','Mararikulam, Alappuzha','Alappuzha','Beach Resorts',4.6,734,11500,18,'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Marari+Beach+Resort','919876543221','12 km from Alappuzha Town','Secluded Beach','A pristine eco-resort on one of Kerala''s most unspoiled beaches.','["Private Beach","Coconut Grove Cottages","Ayurveda Spa","Organic Garden Restaurant","Yoga","Bicycle Hire","Fishing Trips","Free WiFi"]','["Secluded fishing village beach","Traditional thatched cottages","Organic garden dining","No motor vehicles on beachfront"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Marari Beach","Alappuzha Backwaters","St. Andrews Basilica","Krishnapuram Palace"]',true,true,'active')
ON CONFLICT (id) DO NOTHING;

-- Sample coupons
INSERT INTO coupons (code, discount_percent, expiry_date, usage_limit, min_booking_amount, status) VALUES
('KERALA10', 10, '2026-12-31', 500, 3000, 'active'),
('SUMMER20', 20, '2026-09-30', 100, 5000, 'active'),
('WELCOME15', 15, '2026-12-31', 200, 2000, 'active')
ON CONFLICT (code) DO NOTHING;
