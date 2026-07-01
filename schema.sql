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
('hotel-001','Kumarakom Lake Resort','Kumarakom, Kottayam','Kottayam','Luxury Resorts',4.9,1284,22000,18,'/assets/hotels/hotel-001/main.webp','https://maps.app.goo.gl/PzB6x1GzZq47m8rC8','914812524900','150 km from Kochi','Top Rated','A breathtaking luxury resort on the banks of Vembanad Lake.','["Swimming Pool","Spa & Wellness","Backwater Cruise","Restaurant","Bar","Yoga Center","Ayurveda","Free WiFi","AC Rooms","Room Service"]','["Heritage villas on water","Private pool villas available","Sunset boat cruises","Award-winning Ayurveda spa"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Vembanad Lake","Kumarakom Bird Sanctuary","Bay Island Driftwood Museum"]',true,true,'active'),
('hotel-002','Taj Malabar Resort & Spa, Cochin','Willingdon Island, Kochi','Ernakulam','Luxury Resorts',4.8,2156,14200,18,'/assets/hotels/hotel-taj-malabar-cochin/main.webp','https://maps.app.goo.gl/uX3WUikcVofabs3QA','914846643000','5 km from Kochi City Centre','Luxury','Positioned on Willingdon Island overlooking the Arabian Sea.','["Sea View Rooms","Infinity Pool","Spa","Multiple Restaurants","Bar","Fitness Center","Tennis Court","Free WiFi","Concierge","Airport Transfer"]','["Harbour view rooms","Heritage building","Fine dining restaurants","Marina adjacent"]','{"checkIn":"3:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Fort Kochi","Chinese Fishing Nets","Mattancherry Palace","Jew Town"]',true,false,'active'),
('hotel-003','Spice Village Thekkady','Thekkady, Idukki','Idukki','Homestays',4.7,876,12500,12,'/assets/images/spice_heritage.webp','https://maps.app.goo.gl/g69fVshgR2pGgS6p9','914869224514','4 km from Periyar Wildlife Sanctuary','Eco Stay','Award-winning eco-resort featuring traditional Kerala cottages amid spice plantations.','["Spice Plantation Walk","Ayurveda Treatments","Campfire","Restaurant","Yoga","Wildlife Safaris","Cultural Shows","Free WiFi"]','["Spice plantation walks","Periyar Tiger Reserve nearby","Authentic Kerala cuisine","Eco-certified property"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 72 hours before check-in"}','["Periyar Tiger Reserve","Kumily Spice Market","Mangaladevi Temple"]',true,true,'active'),
('hotel-004','Lakes & Lagoons Houseboat Alleppey','Punnamada Lake, Alappuzha','Alappuzha','Houseboats',4.6,543,11500,12,'/assets/images/alappuzha.webp','https://maps.app.goo.gl/hGzNgr3GvY7uXz7z7','914772230922','3 km from Alappuzha Town','Backwaters','A luxury AC houseboat cruising the serene backwaters of Alleppey.','["AC Bedrooms","Sun Deck","Private Crew","Full Board Meals","Village Tour","Canoe Ride","Fishing","Sunset Cruise"]','["2-bedroom luxury houseboat","Cruising the Vembanad Lake","All meals included","Village and paddy field views"]','{"checkIn":"12:00 PM","checkOut":"9:00 AM","breakfast":"Included (Full Board)","cancellation":"Free cancellation 48 hours before check-in"}','["Alappuzha Beach","Krishnapuram Palace","Marari Beach"]',true,true,'active'),
('hotel-005','Elixir Hills Suites Resort Munnar','Near Letchmi Estate, Mankulam, Munnar','Idukki','Hill Station Hotels',4.5,712,9800,12,'/assets/hotels/hotel-elixir-hills/main.webp','https://maps.app.goo.gl/G6qWdYhHnJtzt3tZ9','919495000523','8 km from Munnar Town','Scenic View','Perched at 5,000 feet above sea level with panoramic tea plantation views.','["Tea Plantation View","Fireplace","Restaurant","Tea Factory Visit","Trekking","Bird Watching","Free WiFi","Bonfire"]','["360 degree tea garden views","Tea factory guided tour","Cool climate year-round","Trekking trails nearby"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Eravikulam National Park","Mattupetty Dam","Anamudi Peak","Photo Point"]',false,true,'active'),
('hotel-006','The Gateway Hotel Varkala','North Cliff, Varkala','Thiruvananthapuram','Beach Resorts',4.4,634,11000,12,'/assets/images/varkala.webp','https://maps.app.goo.gl/BThh2T2nZ117G8yT8','914702773000','51 km from Thiruvananthapuram','Beachfront','Dramatic clifftop location with stunning views of the Arabian Sea.','["Cliffside Restaurant","Beach Access","Yoga Classes","Surfing Lessons","Infinity Pool","Spa","Free WiFi","Bonfire"]','["Cliff-edge sea views","Natural mineral spring on beach","Surfer-friendly beach","Authentic local restaurants nearby"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Varkala Beach","Janardhana Swami Temple","Black Beach","Sivagiri Mutt"]',false,false,'active'),
('hotel-007','Vythiri Resort Wayanad','Vythiri, Wayanad','Wayanad','Homestays',4.8,421,16500,12,'/assets/images/wayanad.webp','https://maps.app.goo.gl/zB33XzhhR2zP9z8y9','914936256356','15 km from Kalpetta','Nature Retreat','Extraordinary treehouse and jungle resort in the Wayanad rainforest.','["Treehouse Stay","Rope Bridges","Nature Walks","Tribal Village Tour","Waterfall Trek","Bird Watching","Campfire","Organic Meals"]','["90-foot high treehouse","Rope bridge adventures","Ancient tribal heritage tours","Banasura Sagar Dam nearby"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Chembra Peak","Banasura Sagar Dam","Edakkal Caves","Soochippara Waterfall"]',true,true,'active'),
('hotel-008','The Leela Kovalam, A Raviz Hotel','Lighthouse Beach, Kovalam','Thiruvananthapuram','Beach Resorts',4.3,987,18500,18,'/assets/images/kovalam.webp','https://maps.app.goo.gl/6pZ7tXzZ9z3z7y6b9','914713051234','16 km from Thiruvananthapuram Airport','Beachfront','India''s premier beachside resort overlooks the famous crescent-shaped Lighthouse Beach.','["Private Beach","Infinity Pool","Ayurveda Center","Multi-cuisine Restaurant","Bar","Water Sports","Spa","Free WiFi","Fitness Center"]','["Crescent-shaped lighthouse beach","Lighthouse view from property","Award-winning Ayurveda treatments","Fresh catch seafood daily"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Kovalam Lighthouse","Vizhinjam Rock Cut Cave","Halcyon Castle","Padmanabhaswamy Temple"]',false,true,'active'),
('hotel-009','Fort House Hotel Kochi','Fort Kochi, Ernakulam','Ernakulam','Business Hotels',4.5,823,3800,12,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Fort+Kochi','919876543218','1 km from Fort Kochi','Heritage','A charming heritage boutique hotel in the heart of historic Fort Kochi.','["Waterfront Dining","Heritage Tours","Boat Jetty","Conference Room","Free WiFi","Cycling Tours","Cultural Activities","AC Rooms"]','["Colonial Dutch architecture","Chinese fishing nets walk away","Waterfront restaurant","Antique Kochi museum next door"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 24 hours before check-in"}','["Chinese Fishing Nets","St. Francis Church","Mattancherry Palace","Paradesi Synagogue"]',false,false,'active'),
('hotel-010','Thrissur Gateway Hotel','Sakthan Nagar, Thrissur','Thrissur','Business Hotels',4.2,512,2900,12,'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Thrissur+City+Center','919876543219','1 km from Thrissur Railway Station','City Center','A modern business hotel in the cultural capital of Kerala, Thrissur.','["Conference Halls","Restaurant","Bar","Room Service","Free WiFi","Parking","Laundry","AC Rooms","Business Center"]','["Thrissur Pooram festival hub","Near Vadakkumnathan Temple","Shopping district walking distance","Best Kerala sadya restaurant onsite"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"}','["Vadakkumnathan Temple","Thrissur Zoo","Archaeological Museum","Shakthan Thampuran Palace"]',false,false,'active'),
('hotel-011','Kalari Kovilakom Palace','Kollengode, Palakkad','Palakkad','Luxury Resorts',4.9,298,22000,18,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Kalari+Kovilakom+Palakkad','919876543220','75 km from Coimbatore Airport','Palace Stay','A 19th-century royal palace converted into an exclusive Ayurveda retreat.','["Ayurveda Palace","Doctor Consultation","Panchakarma","Yoga Hall","Meditation Garden","Organic Meals","Heritage Library","Nature Walks"]','["19th-century royal palace","Personalized Ayurveda programs","Resident Ayurvedic doctors","Organic farm-to-table meals"]','{"checkIn":"3:00 PM","checkOut":"11:00 AM","breakfast":"Included (Full Board)","cancellation":"Non-refundable"}','["Kollengode Palace Gardens","Silent Valley National Park","Malampuzha Dam","Nelliyampathy Hills"]',true,false,'active'),
('hotel-012','Marari Beach Resort','Mararikulam, Alappuzha','Alappuzha','Beach Resorts',4.6,734,11500,18,'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Marari+Beach+Resort','919876543221','12 km from Alappuzha Town','Secluded Beach','A pristine eco-resort on one of Kerala''s most unspoiled beaches.','["Private Beach","Coconut Grove Cottages","Ayurveda Spa","Organic Garden Restaurant","Yoga","Bicycle Hire","Fishing Trips","Free WiFi"]','["Secluded fishing village beach","Traditional thatched cottages","Organic garden dining","No motor vehicles on beachfront"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"}','["Marari Beach","Alappuzha Backwaters","St. Andrews Basilica","Krishnapuram Palace"]',true,true,'active')
ON CONFLICT (id) DO NOTHING;

-- New category hotels (added 2026)
INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status) VALUES
('hotel-013','Kairali Ayurvedic Resort','Palakkad, Palakkad','Palakkad','Ayurveda Resorts',4.8,567,12500,18,'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Kairali+Ayurvedic+Resort+Palakkad','919876543222','80 km from Coimbatore','Wellness','One of Kerala''s most acclaimed Ayurveda resorts offering authentic Panchakarma treatments, personalised wellness programs and meditative forest walks in a 50-acre healing campus.','["Panchakarma Center","Doctor Consultation","Yoga Hall","Meditation Garden","Organic Meals","Herbal Pool","Nature Walks","Library","Ayurveda Pharmacy"]','["Authentic Panchakarma programs","50-acre healing campus","Resident Ayurvedic doctors","Organic herb garden","Forest meditation trails"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included (Full Board)","cancellation":"72 hours free cancellation"}','["Silent Valley National Park","Malampuzha Dam","Nelliyampathy Hills","Dhoni Waterfalls"]',true,true,'active'),
('hotel-014','Bamboo Grove Eco Lodge','Vythiri, Wayanad','Wayanad','Eco Lodges',4.7,342,4800,12,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Vythiri+Wayanad','919876543223','22 km from Kalpetta','Eco Certified','A zero-plastic, solar-powered eco lodge hidden in a bamboo forest at 900m altitude in Wayanad. All structures are built from reclaimed bamboo and local stone with minimal environmental footprint.','["Solar Power","Bamboo Cottages","Organic Farm","Nature Walks","Bird Watching","Tribal Tours","Campfire","Organic Meals","Bicycle Hire"]','["Zero-plastic certified property","Solar-powered bamboo cottages","Organic permaculture farm","Tribal village cultural tours","Rare bird species sightings"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"48 hours free cancellation"}','["Chembra Peak","Soochippara Waterfall","Edakkal Caves","Banasura Sagar Dam"]',false,true,'active'),
('hotel-015','Machan Treehouse Resort','Thekkady, Idukki','Idukki','Treehouse Stays',4.9,218,8200,12,'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Thekkady+Idukki+Kerala','919876543224','5 km from Periyar Tiger Reserve','Unique Stay','Spectacular treehouses built on giant jackfruit and teak trees at 60-80 feet height inside a private forest reserve bordering the Periyar Tiger Reserve. Elephants are regular visitors at dawn.','["Treehouse Rooms","Rope Bridges","Wildlife Safaris","Night Jungle Walks","Bonfire","Organic Meals","Bird Watching","Swimming Hole","Canoe Ride"]','["60-80 ft high treehouses","Wild elephant sightings daily","Rope bridge forest walk","Periyar boat safari nearby","Private forest reserve"]','{"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"72 hours free cancellation"}','["Periyar Tiger Reserve","Kumily Spice Market","Mangaladevi Temple","Chellarkovil Viewpoint"]',true,true,'active'),
('hotel-016','Dutch Palace Heritage Hotel','Mattancherry, Ernakulam','Ernakulam','Heritage Hotels',4.6,445,6500,12,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Mattancherry+Kochi','919876543225','2 km from Fort Kochi','Heritage','A magnificently restored 17th-century Dutch-era spice merchant mansion in the historic Mattancherry quarter, featuring original teak columns, antique Kerala murals and a rooftop spice garden.','["Heritage Architecture","Rooftop Restaurant","Antique Library","Heritage Tours","Cooking Classes","Spice Garden","Cultural Shows","Free WiFi","AC Rooms"]','["17th century Dutch mansion","Original Kerala mural paintings","Rooftop spice garden restaurant","Mattancherry Palace next door","Jew Town walking distance"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"24 hours free cancellation"}','["Mattancherry Palace","Paradesi Synagogue","Jew Town","Chinese Fishing Nets","Spice Market"]',false,false,'active'),
('hotel-017','Wayanad Wildlife Cottages','Sultan Bathery, Wayanad','Wayanad','Wildlife Resorts',4.5,289,5500,12,'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Sultan+Bathery+Wayanad','919876543226','4 km from Muthanga Wildlife Sanctuary','Wildlife','Jungle-edge cottages on the fringes of Wayanad Wildlife Sanctuary, where herds of elephants, tigers, leopards and gaur pass through at dusk. Guided jeep safaris available at dawn.','["Jeep Safari","Elephant Watching","Bird Watching","Nature Trails","Campfire","Restaurant","Free WiFi","Naturalist Guide","Watchtower"]','["Daily elephant herd sightings","Tiger and leopard territory","Dawn and dusk jeep safaris","Expert naturalist guides","Wayanad Wildlife Sanctuary access"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"48 hours free cancellation"}','["Muthanga Wildlife Sanctuary","Edakkal Caves","Banasura Sagar Dam","Thirunelli Temple"]',false,true,'active'),
('hotel-018','Amalfi Couple Retreat Varkala','Varkala, Thiruvananthapuram','Thiruvananthapuram','Couple Retreats',4.7,376,7800,12,'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Varkala+Beach+Kerala','919876543227','53 km from Thiruvananthapuram','Couples','A romantic clifftop hideaway in Varkala designed exclusively for couples, with private plunge pools, sunset dining, couples Ayurveda massages, and personalized honeymoon packages.','["Private Plunge Pool","Couples Spa","Sunset Dining","Champagne Welcome","Honeymoon Package","Candlelight Dinners","Cliff View Rooms","Beach Access","Yoga"]','["Private plunge pool in every villa","Exclusive couples-only property","Cliff-edge sunset dinner","Personalized honeymoon packages","Couples Ayurveda treatments"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"48 hours free cancellation"}','["Varkala Beach","Janardhana Swami Temple","Natural Spring","Sivagiri Mutt"]',true,true,'active'),
('hotel-019','Pilgrim Rest House Guruvayur','Guruvayur, Thrissur','Thrissur','Pilgrimage Stays',4.3,821,1800,5,'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Guruvayur+Temple+Kerala','919876543228','29 km from Thrissur','Pilgrimage','A comfortable and affordable pilgrim rest house just 200 meters from the sacred Guruvayur Sri Krishna Temple, offering pure vegetarian meals, early morning temple darshan packages and spiritual retreat programs.','["Pure Veg Restaurant","Temple Darshan Package","Prayer Hall","Meditation Room","AC Rooms","Free Parking","Luggage Storage","Wake-up Call Service"]','["200m from Guruvayur Temple","Early morning darshan packages","Pure vegetarian meals","Elephant sanctuary nearby","Spiritual retreat programs"]','{"checkIn":"12:00 PM","checkOut":"10:00 AM","breakfast":"Included","cancellation":"24 hours free cancellation"}','["Guruvayur Sri Krishna Temple","Punnathur Kotta Elephant Sanctuary","Chavakkad Beach","Thrissur City"]',false,false,'active'),
('hotel-020','Backpackers Bazaar Kochi','Fort Kochi, Ernakulam','Ernakulam','Backpacker Hostels',4.4,934,850,5,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80','https://maps.google.com/?q=Fort+Kochi+Hostel','919876543229','0.5 km from Fort Kochi Ferry','Budget','Fort Kochi''s most social backpacker hostel, steps from the Chinese fishing nets, with a rooftop café, free bicycle hire, shared dorms from ₹850/night, and a weekly Kerala cooking class for guests.','["Dorm Beds","Private Rooms","Rooftop Café","Free WiFi","Bicycle Hire","Common Kitchen","Locker Storage","Tour Desk","Laundry","Cultural Nights"]','["Walking distance to Chinese fishing nets","Free bicycle hire","Weekly Kerala cooking class","Vibrant social common area","Cheapest quality stay in Fort Kochi"]','{"checkIn":"12:00 PM","checkOut":"11:00 AM","breakfast":"Available","cancellation":"24 hours free cancellation"}','["Chinese Fishing Nets","Mattancherry Palace","Paradesi Synagogue","Fort Kochi Beach"]',false,true,'active')
ON CONFLICT (id) DO NOTHING;

-- Real curated reviews
INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, status) VALUES
('rev-001','hotel-001','Kumarakom Lake Resort','u1','Priya Nair','https://i.pravatar.cc/60?img=47',5,'Absolutely magical experience! The water villas are breathtaking and the sunset views over Vembanad Lake are unforgettable. Staff were incredibly warm and attentive. The Ayurveda spa treatments were world-class. Will definitely return!','approved'),
('rev-002','hotel-001','Kumarakom Lake Resort','u2','Rahul Menon','https://i.pravatar.cc/60?img=12',5,'The heritage villas over the water are unlike anything else in India. Breakfast on the deck watching egrets fly over the lake — pure Kerala magic. The Ayurveda massages cured my back pain completely!','approved'),
('rev-003','hotel-002','Taj Malabar Resort','u3','Ananya Krishnan','https://i.pravatar.cc/60?img=23',5,'Perfect Kochi experience. The harbour view rooms are stunning — watching container ships pass by the Chinese fishing nets is surreal. Exceptional service, the concierge arranged a private Fort Kochi heritage walk for us.','approved'),
('rev-004','hotel-002','Taj Malabar Resort','u4','Vikram Suresh','https://i.pravatar.cc/60?img=33',4,'Beautiful property with fantastic location. The infinity pool is a gem. Food quality at the Harbour restaurant is excellent — try the Kerala red fish curry! Room service was slightly slow but overall an amazing stay.','approved'),
('rev-005','hotel-003','Spice Village Thekkady','u5','Meera Pillai','https://i.pravatar.cc/60?img=43',5,'The most unique eco-resort we have stayed at. Woke up to the smell of cardamom every morning! The guided spice plantation walk was educational and fun. They cooked a traditional Kerala sadya that blew our minds.','approved'),
('rev-006','hotel-004','Houseboat Delight Alleppey','u6','Arjun Thomas','https://i.pravatar.cc/60?img=53',5,'The best 2 days of our honeymoon! Gliding through the backwaters, watching village life on the banks, eating fresh fish curry cooked by our crew — nothing compares to this. A must-do Kerala experience!','approved'),
('rev-007','hotel-005','Munnar Retreat','u7','Deepa George','https://i.pravatar.cc/60?img=9',4,'Woke up at 6am to see clouds rolling through the tea gardens from our balcony — absolutely mesmerizing! The tea factory tour was fascinating. Nights are cold so bring a jacket. The fireplace in the room was romantic.','approved'),
('rev-008','hotel-006','Varkala Cliff Beach Resort','u8','Sanjay Kumar','https://i.pravatar.cc/60?img=18',4,'Stunning clifftop views of the Arabian Sea. The natural spring beach below the cliff is unique to Varkala. Great surfing spots nearby. The restaurant serves amazing fresh seafood. Best sunset views in Kerala!','approved'),
('rev-009','hotel-007','Wayanad Green Magic','u9','Lakshmi Iyer','https://i.pravatar.cc/60?img=38',5,'Sleeping 90 feet up in a treehouse surrounded by the Wayanad rainforest is an experience you cannot describe in words. The rope bridge walk is thrilling. Woke up to hornbills and spotted deer below our tree. Truly magical!','approved'),
('rev-010','hotel-008','Kovalam Ashok Beach Resort','u10','Ravi Sharma','https://i.pravatar.cc/60?img=27',4,'Perfect beachfront location at the iconic crescent-shaped Lighthouse Beach. The Ayurveda center here is world-renowned — booked a 5-day Panchakarma program. Great pool and food. The lighthouse walk at sunset is unmissable!','approved'),
('rev-011','hotel-011','Kalari Kovilakom Palace','u11','Sunitha Nambiar','https://i.pravatar.cc/60?img=41',5,'A truly transformative Ayurveda experience inside a 19th-century palace. The resident doctors are brilliant — my personalised treatment plan was detailed and effective. The organic farm-to-table meals are therapeutic. Will come back every year!','approved'),
('rev-012','hotel-012','Marari Beach Resort','u12','Arun Balakrishnan','https://i.pravatar.cc/60?img=56',5,'The most pristine, peaceful beach in Kerala. No motor vehicles, no crowds — just coconut palms, fishing boats, and stars at night. The thatched cottages are charming and the organic garden restaurant is superb. Paradise found!','approved'),
('rev-013','hotel-009','Fort House Hotel Kochi','u13','Diana Mathew','https://i.pravatar.cc/60?img=22',5,'A heritage gem in Fort Kochi. Woke up to the sound of the harbour and walked to the Chinese fishing nets for sunrise. The colonial Dutch architecture is beautifully preserved. Excellent base to explore all of Fort Kochi on foot or cycle!','approved')
ON CONFLICT (review_id) DO NOTHING;

-- Sample coupons
INSERT INTO coupons (code, discount_percent, expiry_date, usage_limit, min_booking_amount, status) VALUES
('KERALA10', 10, '2026-12-31', 500, 3000, 'active'),
('SUMMER20', 20, '2026-09-30', 100, 5000, 'active'),
('WELCOME15', 15, '2026-12-31', 200, 2000, 'active')
ON CONFLICT (code) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- NEW HOTELS SEED (Added 2026-07-01)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO hotels (
  id, name, location, district, category,
  rating, reviews_count, price, tax,
  image, images,
  map_url, whatsapp,
  distance, badge, description,
  amenities, highlights, details, nearby,
  featured, trending, status
) VALUES
(
  'hotel-grand-hyatt-kochi',
  'Grand Hyatt Kochi Bolgatty',
  'Bolgatty Island, Kochi',
  'Ernakulam',
  'Luxury Resorts',
  4.7, 1842, 12600, 18,
  '/assets/hotels/hotel-grand-hyatt-kochi/main.webp',
  '[
    "/assets/hotels/hotel-grand-hyatt-kochi/room1.webp",
    "/assets/hotels/hotel-grand-hyatt-kochi/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/CZEvnNYH5zk2Zt5R6',
  '914842661234',
  '8 km from Kochi Airport',
  'Island Resort',
  'Grand Hyatt Kochi Bolgatty is Kerala''s most spectacular island luxury resort, perched on the exclusive Bolgatty Island in Vembanad Lake. The 234-room property offers stunning harbour and backwater views, an award-winning spa, six dining venues, and the largest ballroom in Kerala. A private water taxi connects guests to the city.',
  '["Infinity Pool","Island Location","6 Restaurants & Bars","Grand Spa","Fitness Center","Water Taxi","Banquet Halls","Tennis Court","Kids Club","Free WiFi","Butler Service","Harbour View Rooms","Helipad","Valet Parking"]'::jsonb,
  '["Private island resort on Vembanad Lake","Water taxi to city centre","Largest ballroom in Kerala","Spectacular harbour & backwater views","Celebrity chef dining experiences"]'::jsonb,
  '{"checkIn":"3:00 PM","checkOut":"12:00 PM","breakfast":"Available (Buffet — Rs.1800 per person)","cancellation":"Free cancellation 24 hours before check-in","phone":"+91 484 266 1234","email":"kochi.grand@hyatt.com","imageAlt":"Grand Hyatt Kochi Bolgatty exterior luxury island resort on Vembanad Lake","roomAlts":["Grand Hyatt Kochi Bolgatty premium guest bedroom room view","Grand Hyatt Kochi Bolgatty grand bathroom suite with bathtub and luxury amenities"]}'::jsonb,
  '["Fort Kochi (10 km)","Marine Drive (6 km)","Cochin International Airport (8 km)","Bolgatty Palace (0.5 km)","Chinese Fishing Nets (12 km)"]'::jsonb,
  true, true, 'active'
),
(
  'hotel-crowne-plaza-kochi',
  'Crowne Plaza Kochi',
  'Kundanoor Junction, NH 47 Bypass, Maradu, Kochi',
  'Ernakulam',
  'Business Hotels',
  4.5, 2134, 6800, 18,
  '/assets/hotels/hotel-crowne-plaza-kochi/main.webp',
  '[
    "/assets/hotels/hotel-crowne-plaza-kochi/room1.webp",
    "/assets/hotels/hotel-crowne-plaza-kochi/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/WJYrNv8U4UDWp8QP8',
  '914847115000',
  '12 km from Kochi Airport',
  'Business Luxury',
  'Crowne Plaza Kochi is a premium IHG hotel located on the NH 47 Bypass at Maradu, offering 237 well-appointed rooms with stunning backwater views. Popular with both business and leisure travellers, it features world-class conference facilities, an outdoor pool, an award-winning restaurant Essence, and the stylish Xcessories Bar.',
  '["Outdoor Pool","Fitness Center","Spa","Essence Restaurant","Xcessories Bar","Business Center","6 Conference Halls","Free WiFi","Valet Parking","Airport Shuttle","Concierge","Room Service 24x7","Laundry Service"]'::jsonb,
  '["Backwater & lake view rooms","NH 47 highway frontage","IHG loyalty rewards","Award-winning Essence restaurant","Conference facilities for 1,200 delegates"]'::jsonb,
  '{"checkIn":"3:00 PM","checkOut":"12:00 PM","breakfast":"Available (Rs.850/person)","cancellation":"Free cancellation 24 hours before check-in","phone":"+91 484 711 5000","email":"reservations.crowneplazakochi@ihg.com","imageAlt":"Crowne Plaza Kochi main pool and exterior building at Maradu Kundanoor Junction","roomAlts":["Crowne Plaza Kochi executive luxury room design","Crowne Plaza Kochi guest suite bedroom and work desk"]}'::jsonb,
  '["Vembanad Lake (2 km)","Lulu Mall (8 km)","Marine Drive (10 km)","Cochin Airport (12 km)","Fort Kochi (20 km)"]'::jsonb,
  true, false, 'active'
),
(
  'hotel-taj-malabar-cochin',
  'Taj Malabar Resort & Spa, Cochin',
  'Willingdon Island, Kochi',
  'Ernakulam',
  'Luxury Resorts',
  4.8, 3267, 14200, 18,
  '/assets/hotels/hotel-taj-malabar-cochin/main.webp',
  '[
    "/assets/hotels/hotel-taj-malabar-cochin/room1.webp",
    "/assets/hotels/hotel-taj-malabar-cochin/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/uX3WUikcVofabs3QA',
  '914846643000',
  '5 km from Kochi City Centre',
  'Heritage Luxury',
  'The Taj Malabar Resort & Spa is Kochi''s most iconic luxury property — a heritage masterpiece on Willingdon Island overlooking the Arabian Sea harbour. Originally built in 1935 and completely renovated in 2024, it features 103 elegant rooms, an infinity pool overlooking the backwaters, award-winning Jiva Ayurveda Spa, and the legendary Rice Boat Restaurant.',
  '["Infinity Pool with Harbour View","Jiva Ayurveda Spa","Rice Boat Restaurant","Harbour Restaurant","Bar","Fitness Centre","Heritage Architecture","Concierge","Valet Parking","Airport Transfer","Business Centre","Free WiFi","Butler Service"]'::jsonb,
  '["Heritage 1935 property with sea & harbour views","Legendary Rice Boat fine dining restaurant","Award-winning Jiva Spa & Ayurveda","Chinese fishing nets visible from pool deck","Completely renovated in 2024"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in","phone":"+91 484 664 3000","email":"malabar.cochin@tajhotels.com","imageAlt":"Taj Malabar Resort & Spa Cochin heritage resort exterior overlooking Arabian Sea","roomAlts":["Taj Malabar Resort & Spa Cochin heritage premium guest suite","Taj Malabar Resort & Spa Cochin dining by the waterfront with sunset views"]}'::jsonb,
  '["Chinese Fishing Nets (3 km)","Fort Kochi (4 km)","Mattancherry Palace (5 km)","Cochin Airport (12 km)","Jew Town (5 km)"]'::jsonb,
  true, true, 'active'
),
(
  'hotel-postcard-mandalay-hall',
  'The Postcard Mandalay Hall',
  'Fort Kochi, Ernakulam',
  'Ernakulam',
  'Luxury Resorts',
  4.9, 412, 17500, 18,
  '/assets/hotels/hotel-postcard-mandalay-hall/main.webp',
  '[
    "/assets/hotels/hotel-postcard-mandalay-hall/room1.webp",
    "/assets/hotels/hotel-postcard-mandalay-hall/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/iqeVTHrDZYak1V8H8',
  '917999555222',
  '0.5 km from Fort Kochi Ferry',
  'Ultra Boutique',
  'The Postcard Mandalay Hall is Fort Kochi''s most exclusive boutique hotel — a lovingly restored 1800s Burmese teak mansion with just 9 curated suites. Each suite is uniquely designed with rare antiques, custom-crafted furniture, and heritage artwork. Features a heritage courtyard, private library, chef''s table dining and bespoke concierge.',
  '["9 Unique Heritage Suites","Private Library","Chef Table Dining","Heritage Courtyard","Bespoke Concierge","Curated Art Collection","Antique Decor","Fort Kochi Walking Tours","Bicycle Hire","Cultural Immersion","Free WiFi","Room Service"]'::jsonb,
  '["Only 9 suites — ultra-exclusive","1800s Burmese teak heritage mansion","Bespoke chef table dining","Curated antique art collection","Walking distance to Fort Kochi heritage sites"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Non-refundable — contact hotel for exceptions","phone":"+91 79995 55222","email":"book@postcardresorts.com","imageAlt":"The Postcard Mandalay Hall heritage courtyard luxury boutique hotel Fort Kochi","roomAlts":["The Postcard Mandalay Hall art-centric luxury guest suite interior","The Postcard Mandalay Hall premium library and lobby area lounge"]}'::jsonb,
  '["Chinese Fishing Nets (0.8 km)","St Francis Church (0.5 km)","Mattancherry Palace (2 km)","Fort Kochi Beach (1 km)","Paradesi Synagogue (2.5 km)"]'::jsonb,
  true, true, 'active'
),
(
  'hotel-gokulam-grand-kumarakom',
  'Gokulam Grand Resort and Spa Kumarakom',
  'Athikkalam, Kumarakom, Kottayam',
  'Kottayam',
  'Luxury Resorts',
  4.6, 876, 13500, 18,
  '/assets/hotels/hotel-gokulam-grand-kumarakom/main.webp',
  '[
    "/assets/hotels/hotel-gokulam-grand-kumarakom/room1.webp",
    "/assets/hotels/hotel-gokulam-grand-kumarakom/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/wsRWo8w7UdWqF9Mk8',
  '919288003330',
  '14 km from Kottayam City',
  'Backwater Luxury',
  'Gokulam Grand Resort and Spa Kumarakom is a sprawling lakeside luxury resort on the banks of Vembanad Lake offering breathtaking backwater views. Features lake view villas, pool villas, a state-of-the-art Ayurveda spa, an infinity pool overlooking Vembanad, sunset boat cruises, houseboat experiences, and exquisite Kerala cuisine at their lakeside restaurant.',
  '["Infinity Pool Overlooking Vembanad","Lake View Villas","Pool Villas","Ayurveda Spa","Sunset Boat Cruise","Houseboat Experience","Lakeside Restaurant","Bar","Fitness Center","Yoga Centre","Bird Watching","Shikara Rides","Free WiFi","Airport Transfer"]'::jsonb,
  '["Panoramic Vembanad Lake views","Private pool villas available","Sunset and sunrise shikara rides","Authentic Kerala Ayurveda spa","Kumarakom Bird Sanctuary adjacent"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in","phone":"+91 92880 03330","email":"sales.kmk@gokulamhotels.com","imageAlt":"Gokulam Grand Resort and Spa Kumarakom lakeside pool and resort grounds","roomAlts":["Gokulam Grand Resort and Spa Kumarakom premium lakeview suite bedroom","Gokulam Grand Resort and Spa Kumarakom tropical garden cottage exterior"]}'::jsonb,
  '["Kumarakom Bird Sanctuary (1 km)","Vembanad Lake (on property)","Kottayam City (14 km)","Alappuzha (30 km)","Kochi Airport (55 km)"]'::jsonb,
  true, true, 'active'
),
(
  'hotel-niraamaya-backwaters-kumarakom',
  'Niraamaya Retreats Backwaters & Beyond',
  'Kumarakom, Kottayam',
  'Kottayam',
  'Ayurveda Resorts',
  4.8, 634, 13500, 18,
  '/assets/hotels/hotel-niraamaya-backwaters-kumarakom/main.webp',
  '[
    "/assets/hotels/hotel-niraamaya-backwaters-kumarakom/room1.webp",
    "/assets/hotels/hotel-niraamaya-backwaters-kumarakom/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/X1DHTHBN816fcK4Y7',
  '914812527700',
  '13 km from Kottayam City',
  'Wellness Retreat',
  'Niraamaya Retreats Backwaters & Beyond is one of Kerala''s most celebrated Ayurveda wellness retreats, set amid lush paddy fields and backwater canals in Kumarakom. The retreat offers traditional Kerala Ayurveda therapies with resident doctors, private lake view villas, a tranquil meditation garden, and an organic farm-to-table restaurant.',
  '["Traditional Ayurveda Treatments","Resident Ayurvedic Doctors","Lake View Private Villas","Infinity Pool","Meditation Garden","Yoga Studio","Organic Restaurant","Shikara Rides","Bird Watching","Paddy Field Walks","Cultural Evenings","Free WiFi","Spa"]'::jsonb,
  '["Traditional Kerala Ayurveda with resident doctors","Personalized wellness programs","Lake view private villa retreats","Organic farm-to-table dining","Tranquil paddy field and backwater setting"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included (Full Board Available)","cancellation":"Free cancellation 72 hours before check-in","phone":"+91 481 252 7700","email":"reservations@niraamaya.com","imageAlt":"Niraamaya Retreats Backwaters & Beyond Kumarakom lush gardens and wellness paths","roomAlts":["Niraamaya Retreats Backwaters & Beyond luxury lake view cottage interior","Niraamaya Retreats Backwaters & Beyond tranquil spa treatment room"]}'::jsonb,
  '["Kumarakom Bird Sanctuary (2 km)","Vembanad Lake","Kottayam City (13 km)","Bay Island Driftwood Museum (3 km)","Alappuzha (28 km)"]'::jsonb,
  true, false, 'active'
),
(
  'hotel-rhythm-kumarakom',
  'Rhythm Kumarakom',
  'Amankari Road, Kumarakom, Kottayam',
  'Kottayam',
  'Luxury Resorts',
  4.7, 523, 9500, 18,
  '/assets/hotels/hotel-rhythm-kumarakom/main.webp',
  '[
    "/assets/hotels/hotel-rhythm-kumarakom/room1.webp",
    "/assets/hotels/hotel-rhythm-kumarakom/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/7ZgUaQq4GygSxNTw7',
  '919072845000',
  '12 km from Kottayam City',
  'Boutique Backwater',
  'Rhythm Kumarakom is a serene boutique resort on the banks of Vembanad Lake, offering an intimate and authentic backwater Kerala experience. Features lakeview terrace rooms, poolside cottages, plunge pool villas, a lakeside infinity pool, spa, Ayurveda centre, and the Spice Route restaurant. 15% discount on direct bookings.',
  '["Infinity Pool with Lake View","Lakeview Terrace Rooms","Plunge Pool Villas","Poolside Cottages","Spice Route Restaurant","Ayurveda Centre","Spa","Shikara Rides","Sunset Cruises","Yoga","Bird Watching","Cycling","Free WiFi","Parking"]'::jsonb,
  '["Intimate boutique lakefront property","Plunge pool villas for privacy","Sunset shikara rides on Vembanad","Traditional Kerala cuisine at Spice Route","15% discount on direct bookings"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in","phone":"+91 90728 45000","email":"reservations.kum@rhythmhospitality.com","imageAlt":"Rhythm Kumarakom poolside cottages and backwater resort layout","roomAlts":["Rhythm Kumarakom lakeview terrace deluxe room interior","Rhythm Kumarakom traditional boat jetty at sunset on Vembanad Lake"]}'::jsonb,
  '["Kumarakom Bird Sanctuary (1.5 km)","Vembanad Lake","Kottayam City (12 km)","Alappuzha (28 km)","Kochi Airport (52 km)"]'::jsonb,
  false, true, 'active'
),
(
  'hotel-taj-kumarakom',
  'Taj Kumarakom Resort & Spa',
  'Kavanattinkara, Kumarakom, Kottayam',
  'Kottayam',
  'Luxury Resorts',
  4.9, 1456, 18500, 18,
  '/assets/hotels/hotel-taj-kumarakom/main.webp',
  '[
    "/assets/hotels/hotel-taj-kumarakom/room1.webp",
    "/assets/hotels/hotel-taj-kumarakom/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/L9UYzHU27enMeFpH6',
  '914812525711',
  '13 km from Kottayam City',
  'Top Rated',
  'Taj Kumarakom Resort & Spa is the most iconic luxury resort on Vembanad Lake — a 26-acre heritage estate of cottages and private pool villas seamlessly blending into the surrounding backwater landscape. The Jiva Spa offers world-class Kerala Ayurveda, while the restaurant serves legendary Keralan and international cuisine. Rated among the best resort experiences in Asia.',
  '["26-Acre Heritage Estate","Private Pool Villas","Jiva Spa & Ayurveda","Multiple Restaurants","Infinity Pool","Backwater Dining","Sunset Cruise","Shikara Rides","Yoga Pavilion","Bird Watching","Cycling","Tennis Court","Concierge","Airport Transfer","Butler Service","Free WiFi"]'::jsonb,
  '["26-acre estate on Vembanad Lake","Private pool villas with lake access","Award-winning Jiva Spa","Legendary Keralan and international cuisine","Consistently ranked among Asia best resorts"]'::jsonb,
  '{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in","phone":"+91 481 252 5711","email":"kumarakom.taj@tajhotels.com","imageAlt":"Taj Kumarakom Resort & Spa traditional heritage estate bungalow on Vembanad Lake","roomAlts":["Taj Kumarakom Resort & Spa lake view heritage cottage bedroom","Taj Kumarakom Resort & Spa private plunge pool villa patio"]}'::jsonb,
  '["Kumarakom Bird Sanctuary (1 km)","Vembanad Lake (on property)","Kottayam City (13 km)","Bay Island Museum (5 km)","Alappuzha (30 km)"]'::jsonb,
  true, true, 'active'
),
(
  'hotel-uday-backwater-alappuzha',
  'Uday Backwater Resort',
  'Punnamada Lake, Alappuzha',
  'Alappuzha',
  'Beach Resorts',
  4.5, 789, 6500, 12,
  '/assets/hotels/hotel-uday-backwater-alappuzha/main.webp',
  '[
    "/assets/hotels/hotel-uday-backwater-alappuzha/room1.webp",
    "/assets/hotels/hotel-uday-backwater-alappuzha/room2.webp"
  ]'::jsonb,
  'https://maps.app.goo.gl/S5uQXrxt5AL9QGb6A',
  '919387217501',
  '4 km from Alappuzha Town',
  'Backwater View',
  'Uday Backwater Resort is a beautifully appointed property on the banks of Punnamada Lake in Alappuzha — the Venice of the East. Features lake view deluxe rooms, pool villas, an outdoor pool overlooking the backwaters, an Ayurveda centre, and the lakeside Anjana Restaurant serving fresh Kerala seafood. Perfect base for the Alappuzha-Kollam backwater cruise.',
  '["Outdoor Pool with Lake View","Lake View Deluxe Rooms","Pool Villas","Anjana Restaurant (Lakeside)","Ayurveda Centre","Shikara Rides","Backwater Cruise","Houseboat Access","Canoe Rides","Fishing","Yoga","Free WiFi","Parking","Room Service"]'::jsonb,
  '["On the banks of Punnamada Lake","Alappuzha-Kollam cruise access","Fresh Kerala seafood at Anjana Restaurant","Pool villa with private lake view","Nehru Trophy Boat Race viewpoint"]'::jsonb,
  '{"checkIn":"12:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in","phone":"+91 93872 17501","email":"reservations@udshotels.com","imageAlt":"Uday Backwater Resort Punnamada lakefront layout with boats in Alappuzha","roomAlts":["Uday Backwater Resort lake view deluxe room interior","Uday Backwater Resort lakeside swimming pool and deck"]}'::jsonb,
  '["Punnamada Lake (on property)","Alappuzha Beach (4 km)","Nehru Trophy Boat Race venue","Krishnapuram Palace (14 km)","Marari Beach (12 km)"]'::jsonb,
  true, true, 'active'
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO rooms (id, hotel_id, hotel_name, room_number, type, capacity, price, beds, availability, amenities, inventory) VALUES
('room-ghk-001','hotel-grand-hyatt-kochi','Grand Hyatt Kochi Bolgatty','101','Deluxe King Room',2,12600,1,'available','["King Bed","Harbour View","AC","Free WiFi","Smart TV","Minibar","Safe","Bathtub","Rain Shower"]'::jsonb,30),
('room-ghk-002','hotel-grand-hyatt-kochi','Grand Hyatt Kochi Bolgatty','201','Grand Suite',2,22000,1,'available','["King Bed","Private Balcony","Harbour & Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Butler Service"]'::jsonb,10),
('room-ghk-003','hotel-grand-hyatt-kochi','Grand Hyatt Kochi Bolgatty','301','Family Room',4,18000,2,'available','["2 Queen Beds","Backwater View","AC","Free WiFi","Smart TV","Kids Amenities","Bathtub"]'::jsonb,15),
('room-cpk-001','hotel-crowne-plaza-kochi','Crowne Plaza Kochi','101','Superior Room',2,6800,1,'available','["King Bed","City or Lake View","AC","Free WiFi","Smart TV","Work Desk","Minibar","Rain Shower"]'::jsonb,50),
('room-cpk-002','hotel-crowne-plaza-kochi','Crowne Plaza Kochi','201','Club Room',2,9500,1,'available','["King Bed","Club Lounge Access","Backwater View","AC","Free WiFi","Smart TV","Minibar","Bathtub","Evening Cocktails"]'::jsonb,20),
('room-cpk-003','hotel-crowne-plaza-kochi','Crowne Plaza Kochi','301','Junior Suite',2,13500,1,'available','["King Bed","Separate Living Area","Backwater View","Jacuzzi","AC","Smart TV","Minibar","Butler Service"]'::jsonb,8),
('room-tmr-001','hotel-taj-malabar-cochin','Taj Malabar Resort & Spa, Cochin','101','Superior Heritage Room',2,14200,1,'available','["King Bed","Harbour View","Heritage Decor","AC","Free WiFi","Smart TV","Minibar","Rain Shower","Taj Branded Toiletries"]'::jsonb,20),
('room-tmr-002','hotel-taj-malabar-cochin','Taj Malabar Resort & Spa, Cochin','201','Harbour View Suite',2,24000,1,'available','["King Bed","Full Harbour View","Private Balcony","Living Room","Jacuzzi","Butler Service","AC","Smart TV","Minibar"]'::jsonb,6),
('room-tmr-003','hotel-taj-malabar-cochin','Taj Malabar Resort & Spa, Cochin','301','Pool Suite',2,32000,1,'available','["King Bed","Private Plunge Pool","Sea View","Outdoor Terrace","Butler Service","Jacuzzi","Minibar","Smart TV"]'::jsonb,4),
('room-pmh-001','hotel-postcard-mandalay-hall','The Postcard Mandalay Hall','MS1','Heritage Suite',2,17500,1,'available','["King Bed","Antique Decor","Heritage Architecture","AC","Free WiFi","Premium Toiletries","Private Courtyard View","Bespoke Amenities"]'::jsonb,5),
('room-pmh-002','hotel-postcard-mandalay-hall','The Postcard Mandalay Hall','MS2','Grand Heritage Suite',2,25000,1,'available','["King Bed","Rare Antiques","Private Sitting Room","Curated Art Pieces","AC","Free WiFi","Chef Table Dining Access","Premium Toiletries"]'::jsonb,4),
('room-ggk-001','hotel-gokulam-grand-kumarakom','Gokulam Grand Resort and Spa Kumarakom','101','Deluxe Lake View Room',2,13500,1,'available','["King Bed","Vembanad Lake View","AC","Free WiFi","Smart TV","Minibar","Bathtub","Rain Shower"]'::jsonb,25),
('room-ggk-002','hotel-gokulam-grand-kumarakom','Gokulam Grand Resort and Spa Kumarakom','201','Lake View Villa',2,22000,1,'available','["King Bed","Private Terrace","Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Outdoor Shower"]'::jsonb,10),
('room-ggk-003','hotel-gokulam-grand-kumarakom','Gokulam Grand Resort and Spa Kumarakom','301','Pool Villa',2,28000,1,'available','["King Bed","Private Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Butler Service"]'::jsonb,5),
('room-nrk-001','hotel-niraamaya-backwaters-kumarakom','Niraamaya Retreats Backwaters & Beyond','GV1','Garden Villa',2,13500,1,'available','["King Bed","Garden View","AC","Free WiFi","Smart TV","Ayurveda Toiletries","Rain Shower","Private Deck"]'::jsonb,8),
('room-nrk-002','hotel-niraamaya-backwaters-kumarakom','Niraamaya Retreats Backwaters & Beyond','LV1','Lake View Villa',2,18000,1,'available','["King Bed","Lake View","Private Deck","AC","Free WiFi","Smart TV","Bathtub","Ayurveda Welcome Pack"]'::jsonb,6),
('room-nrk-003','hotel-niraamaya-backwaters-kumarakom','Niraamaya Retreats Backwaters & Beyond','PV1','Pool Villa',2,26000,1,'available','["King Bed","Private Pool","Panoramic Lake View","Living Room","Butler Service","Jacuzzi","AC","Smart TV"]'::jsonb,3),
('room-rkm-001','hotel-rhythm-kumarakom','Rhythm Kumarakom','101','Lakeview Terrace Room',2,9500,1,'available','["King Bed","Vembanad Lake View","Private Terrace","AC","Free WiFi","Smart TV","Minibar","Rain Shower"]'::jsonb,10),
('room-rkm-002','hotel-rhythm-kumarakom','Rhythm Kumarakom','201','Poolside Cottage',2,14500,1,'available','["King Bed","Pool Access","Garden View","Private Patio","AC","Free WiFi","Smart TV","Outdoor Shower"]'::jsonb,6),
('room-rkm-003','hotel-rhythm-kumarakom','Rhythm Kumarakom','301','Plunge Pool Villa',2,19500,1,'available','["King Bed","Private Plunge Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Butler Service"]'::jsonb,4),
('room-tkr-001','hotel-taj-kumarakom','Taj Kumarakom Resort & Spa','101','Lake View Cottage',2,18500,1,'available','["King Bed","Vembanad Lake View","Heritage Cottage","Private Deck","AC","Free WiFi","Smart TV","Minibar","Bathtub","Taj Toiletries"]'::jsonb,15),
('room-tkr-002','hotel-taj-kumarakom','Taj Kumarakom Resort & Spa','201','Luxury Cottage',2,24500,1,'available','["King Bed","Garden & Lake View","Private Outdoor Shower","Living Room","AC","Smart TV","Minibar","Butler Service","Jacuzzi"]'::jsonb,8),
('room-tkr-003','hotel-taj-kumarakom','Taj Kumarakom Resort & Spa','301','Private Pool Villa',2,35000,1,'available','["King Bed","Private Infinity Pool","Panoramic Lake View","Living & Dining Room","Jacuzzi","Butler Service","AC","Smart TV","Premium Minibar"]'::jsonb,4),
('room-ubr-001','hotel-uday-backwater-alappuzha','Uday Backwater Resort','101','Lake View Deluxe Room',2,6500,1,'available','["King Bed","Punnamada Lake View","AC","Free WiFi","Smart TV","Minibar","Rain Shower","Private Balcony"]'::jsonb,20),
('room-ubr-002','hotel-uday-backwater-alappuzha','Uday Backwater Resort','201','Elite Room',2,9500,1,'available','["King Bed","Extended Lake View","AC","Free WiFi","Smart TV","Minibar","Bathtub","In-room Dining"]'::jsonb,10),
('room-ubr-003','hotel-uday-backwater-alappuzha','Uday Backwater Resort','301','Pool Villa',2,15000,1,'available','["King Bed","Private Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Butler Service"]'::jsonb,4)
ON CONFLICT (id) DO NOTHING;


INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, status) VALUES
('rev-021','hotel-grand-hyatt-kochi','Grand Hyatt Kochi Bolgatty','u21','Aishwarya Menon','https://i.pravatar.cc/60?img=47',5,'The water taxi to the island at night was absolutely magical — like arriving in a dream. Room views over Vembanad Lake are breathtaking. The pool and spa are world-class. Best hotel experience in Kerala hands down!','approved'),
('rev-022','hotel-crowne-plaza-kochi','Crowne Plaza Kochi','u22','Suresh Varma','https://i.pravatar.cc/60?img=33',4,'Excellent business hotel with outstanding conference facilities. The Essence restaurant has some of the best buffet spread I have seen in Kerala. Room was spacious and well-maintained. Pool area is lovely with backwater views.','approved'),
('rev-023','hotel-taj-malabar-cochin','Taj Malabar Resort & Spa, Cochin','u23','Preethi Nair','https://i.pravatar.cc/60?img=23',5,'Stayed in the Harbour View Suite — watching ships pass the Chinese fishing nets from my window was surreal. The Rice Boat restaurant deserves a Michelin star. Post-renovation the rooms are stunning. Jiva Spa is world-class.','approved'),
('rev-024','hotel-postcard-mandalay-hall','The Postcard Mandalay Hall','u24','Rohan Mathew','https://i.pravatar.cc/60?img=12',5,'An unmatched boutique experience. The 1800s teak mansion is authentically preserved. Each suite feels like a personal gallery. Chef table dinner was a highlight of our entire Kerala trip. Absolutely worth the price.','approved'),
('rev-025','hotel-gokulam-grand-kumarakom','Gokulam Grand Resort and Spa Kumarakom','u25','Divya Krishnan','https://i.pravatar.cc/60?img=43',5,'The pool villa with private lake view was extraordinary. Woke up to birds flying over Vembanad Lake every morning. The Ayurveda spa treatments were excellent. Sunset shikara ride was the most romantic moment of our trip!','approved'),
('rev-026','hotel-niraamaya-backwaters-kumarakom','Niraamaya Retreats Backwaters & Beyond','u26','Dr. Sreejith Kumar','https://i.pravatar.cc/60?img=18',5,'Came for a 7-day Panchakarma retreat. The resident Ayurvedic doctor was brilliant — my customised treatment plan made a real difference to my health. The villas are stunning and the organic food is therapeutic. Will be back.','approved'),
('rev-027','hotel-rhythm-kumarakom','Rhythm Kumarakom','u27','Anitha George','https://i.pravatar.cc/60?img=38',4,'Smaller and more intimate than the big Kumarakom resorts — which is exactly what we wanted. The plunge pool villa had the most beautiful lake view. Spice Route restaurant food was exceptional Kerala home cooking. Great value!','approved'),
('rev-028','hotel-taj-kumarakom','Taj Kumarakom Resort & Spa','u28','Vijay Anand','https://i.pravatar.cc/60?img=56',5,'The private pool villa directly on Vembanad Lake is a once in a lifetime experience. Woke up to elephants bathing in the lake! The 26-acre estate feels like your own private Kerala paradise. Jiva Spa is transformative.','approved'),
('rev-029','hotel-uday-backwater-alappuzha','Uday Backwater Resort','u29','Meera Thomas','https://i.pravatar.cc/60?img=22',4,'Great value resort in Alleppey with beautiful Punnamada Lake views. The shikara ride at sunset was magical. Anjana restaurant serves fresh Kerala fish curry that is the best I have had anywhere. Perfect base for backwater exploration!','approved')
ON CONFLICT (review_id) DO NOTHING;


-- ─── Additional Premium Hotels Seed Data (added 2026) ───────────────────────
INSERT INTO hotels (id, name, location, district, category, rating, reviews_count, price, tax, image, map_url, whatsapp, distance, badge, description, amenities, highlights, details, nearby, featured, trending, status) VALUES
('hotel-coconut-lagoon','Coconut Lagoon CGH Earth, Kumarakom','Kumarakom, Kottayam','Kottayam','Luxury Resorts',4.8,1432,18500,18,'/assets/hotels/hotel-coconut-lagoon/main.webp','https://maps.app.goo.gl/tJ9D2tN2z67G8yT8','914812528200','14 km from Kottayam City','Eco Luxury','Coconut Lagoon is a celebrated heritage resort accessible only by boat, set in a sheltered cove on Vembanad Lake.','["Lakeside Pool","Heritage Mansions","Canal Vibe","Sunset Shikara Cruise","Butterfly Garden","Ayurveda Centre","Yoga Pavilion","Organic Farm","Bird Watching","Free WiFi","Air Conditioning","Keralan Restaurant"]','["Only accessible by boat","Restored 150-year-old tharavads","Sustainable eco-certified property","Vembanad Lake sunset cruises"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"72 hours free cancellation","phone":"+91 481 252 8200","email":"coconutlagoon@cghearth.com","imageAlt":"Coconut Lagoon CGH Earth traditional lake resort on Vembanad Lake","roomAlts":["Coconut Lagoon heritage guest bungalow room layout","Coconut Lagoon natural pool deck area"]}'::jsonb,'["Kumarakom Bird Sanctuary (1.5 km)","Vembanad Lake","Bay Island Driftwood Museum (4 km)"]'::jsonb,true,true,'active'),
('hotel-fragrant-nature-munnar','Fragrant Nature Munnar','Bison Valley Road, Munnar','Idukki','Hill Station Hotels',4.7,986,8200,12,'/assets/hotels/hotel-fragrant-nature-munnar/main.webp','https://maps.app.goo.gl/g69fVshgR2pGgS6p9','914865230005','6 km from Munnar Town','Misty View','Fragrant Nature Munnar offers premium luxury rooms with fireplaces and private balconies overlooking the misty Bison Valley tea hills.','["Room Fireplace","Panoramic Spa","Bison Valley View","Glass House Café","Gym","Trekking Club","Kids Play Area","Free WiFi","Valet Parking","Laundry Service"]','["In-room fireplaces for chilly nights","Tea plantation views from all rooms","Highest fine dining deck in Munnar","Guided Bison Valley valley walks"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"48 hours free cancellation","phone":"+91 4865 230 005","email":"reservations.mnr@fragrantnature.com","imageAlt":"Fragrant Nature Munnar luxury hillside resort overlooking misty tea gardens","roomAlts":["Fragrant Nature luxury suite room interior with fireplace","Fragrant Nature high-altitude deck view"]}'::jsonb,'["Munnar Tea Museum (8 km)","Eravikulam National Park (14 km)","Anamudi Peak (15 km)"]'::jsonb,true,false,'active'),
('hotel-brunton-boatyard','Brunton Boatyard CGH Earth, Fort Kochi','Calvathy Road, Fort Kochi, Kochi','Ernakulam','Heritage Hotels',4.8,1124,15500,18,'/assets/hotels/hotel-brunton-boatyard/main.webp','https://maps.app.goo.gl/W1DHTHBN816fcK4Y7','914842215461','0.8 km from Fort Kochi Beach','Heritage Luxury','Brunton Boatyard is a beautifully restored heritage hotel built on the remains of a 19th-century Victorian shipbuilding yard.','["Harbour View Pool","Historical Dining","Armory Bar","Sunset Boat Cruise","Ayurveda Centre","Bicycle Hire","Free WiFi","Air Conditioning","Heritage Library","Concierge"]','["Built on a historical 19th-century boatyard","Chinese fishing nets visible from rooms","Sunset harbour cruises included","Historic fusion culinary experiences"]','{"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"72 hours free cancellation","phone":"+91 484 221 5461","email":"bruntonboatyard@cghearth.com","imageAlt":"Brunton Boatyard CGH Earth historic hotel on Fort Kochi harbour front","roomAlts":["Brunton Boatyard colonial style guest bedroom","Brunton Boatyard pool overlooking Fort Kochi harbour"]}'::jsonb,'["Chinese Fishing Nets (0.2 km)","St. Francis Church (0.4 km)","Mattancherry Spice Market (2.5 km)"]'::jsonb,true,true,'active'),
('hotel-elixir-hills','Elixir Hills Suites Resort, Munnar','Near Letchmi Estate, Mankulam, Munnar','Idukki','Luxury Resorts',4.9,854,9800,12,'/assets/hotels/hotel-elixir-hills/main.webp','https://maps.app.goo.gl/G6qWdYhHnJtzt3tZ9','919495000523','12 km from Munnar Town','Rainforest Luxury','Elixir Hills is Munnar''s largest suite-only luxury resort, hidden in the dense rainforest of Letchmi Hills.','["Large Suites Only","Infinity Forest Pool","Rainforest Trekking","Ayurveda Spa","Kids Activity Hub","Multi-cuisine Restaurant","Coffee Lounge","Free WiFi","Valet Parking","Jeep Safaris"]','["Largest luxury suites in Munnar","Surrounded by dense Letchmi rainforest","Infinity pool hanging over the jungle valley","Guided stream walks and birdwatching hikes"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"48 hours free cancellation","phone":"+91 94950 00523","email":"reservations@elixirhills.com","imageAlt":"Elixir Hills Suites Resort infinity pool hanging over the Munnar forest valley","roomAlts":["Elixir Hills expansive guest suite living room","Elixir Hills luxury bedroom with private forest balcony"]}'::jsonb,'["Letchmi Hills Trekking (0.5 km)","Mankulam Elephant Watching (10 km)","Munnar Town (12 km)"]'::jsonb,true,true,'active'),
('hotel-niraamaya-kovalam','Niraamaya Retreats Surya Samudra, Kovalam','Pulinkudi, Mullur, Kovalam, Trivandrum','Thiruvananthapuram','Ayurveda Resorts',4.9,1045,16800,18,'/assets/hotels/hotel-niraamaya-kovalam/main.webp','https://maps.app.goo.gl/PzB6x1GzZq47m8rC8','914712481575','8 km from Kovalam Beach','Cliffside Luxury','Niraamaya Surya Samudra is a dramatic cliffside resort in Kovalam overlooking the Arabian Sea, featuring traditional Keralan heritage cottages.','["Cliff-edge Infinity Pool","Traditional Tharavads","Direct Beach Access","Multi-award Spa","Sea View Dining","Yoga Pavilion","Meditation Gardens","Ayurveda Programs","Free WiFi","Valet Parking"]','["Clifftop tharavad cottages overlooking sea","Infinity pool carved into cliffside rock","Direct private beach access pathways","Multi-award-winning international spa and Ayurveda programs"]','{"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"72 hours free cancellation","phone":"+91 471 248 1575","email":"suryasamudra@niraamaya.com","imageAlt":"Niraamaya Retreats Surya Samudra clifftop infinity pool and Arabian Sea view in Kovalam","roomAlts":["Niraamaya Surya Samudra premium Keralan heritage cottage bedroom","Niraamaya Surya Samudra outdoor sea-view bath area"]}'::jsonb,'["Lighthouse Beach Kovalam (8 km)","Vizhinjam Rock Cut Cave (6 km)","Trivandrum Airport (22 km)"]'::jsonb,true,true,'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, hotel_id, hotel_name, room_number, type, capacity, price, beds, availability, amenities, inventory) VALUES
('room-cl-001', 'hotel-coconut-lagoon', 'Coconut Lagoon CGH Earth, Kumarakom', '101', 'Heritage Mansion', 2, 18500, 1, 'available', '["King Bed","Heritage Tharavad","AC","Free WiFi","Minibar","Outdoor Shower","Tea Maker"]'::jsonb, 20),
('room-cl-002', 'hotel-coconut-lagoon', 'Coconut Lagoon CGH Earth, Kumarakom', '201', 'Private Pool Villa', 2, 28000, 1, 'available', '["King Bed","Private Pool","Lake View","Living Area","AC","Minibar","Butler Service"]'::jsonb, 6),
('room-fnm-001', 'hotel-fragrant-nature-munnar', 'Fragrant Nature Munnar', '101', 'Tropic Green Room', 2, 8200, 1, 'available', '["King Bed","Bison Valley View","AC","Free WiFi","Smart TV","Minibar","Fireplace"]'::jsonb, 15),
('room-fnm-002', 'hotel-fragrant-nature-munnar', 'Fragrant Nature Munnar', '201', 'Moonlight Suite', 2, 12500, 1, 'available', '["King Bed","Valley View Balcony","Jacuzzi","Fireplace","AC","Smart TV","Minibar"]'::jsonb, 8),
('room-bb-001', 'hotel-brunton-boatyard', 'Brunton Boatyard CGH Earth, Fort Kochi', '101', 'Sea Facing Room', 2, 15500, 1, 'available', '["King Bed","Harbour & Sea View","Colonial Decor","AC","Free WiFi","Minibar","Bathtub"]'::jsonb, 22),
('room-bb-002', 'hotel-brunton-boatyard', 'Brunton Boatyard CGH Earth, Fort Kochi', '201', 'Deluxe Suite', 2, 24000, 1, 'available', '["King Bed","Panaromic Sea View","Living Room","Private Balcony","Butler Service","AC","Minibar"]'::jsonb, 4),
('room-eh-001', 'hotel-elixir-hills', 'Elixir Hills Suites Resort, Munnar', '101', 'Deluxe Suite', 2, 9800, 1, 'available', '["King Bed","Forest View","AC","Free WiFi","Smart TV","Minibar","Sofa Seating","Rain Shower"]'::jsonb, 30),
('room-eh-002', 'hotel-elixir-hills', 'Elixir Hills Suites Resort, Munnar', '201', 'Jacuzzi Suite Pool View', 2, 15000, 1, 'available', '["King Bed","In-room Jacuzzi","Pool & Valley View","AC","Smart TV","Minibar","Butler Service"]'::jsonb, 10),
('room-nks-001', 'hotel-niraamaya-kovalam', 'Niraamaya Retreats Surya Samudra, Kovalam', '101', 'Rock Garden Heritage Room', 2, 16800, 1, 'available', '["King Bed","Heritage Tharavad","AC","Free WiFi","Open-to-Sky Bath","Private Garden Deck","Safe"]'::jsonb, 12),
('room-nks-002', 'hotel-niraamaya-kovalam', 'Niraamaya Retreats Surya Samudra, Kovalam', '201', 'Octagon Sea View Villa', 2, 27000, 1, 'available', '["King Bed","Panoramic Sea View","Octagonal Design","AC","Free WiFi","Sundeck","Butler Service"]'::jsonb, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (review_id, hotel_id, hotel_name, user_id, user_name, user_photo, rating, comment, status) VALUES
('rev-cgl-001', 'hotel-coconut-lagoon', 'Coconut Lagoon CGH Earth, Kumarakom', 'u30', 'Harish Nair', 'https://i.pravatar.cc/60?img=11', 5, 'Arriving by boat sets the perfect mood. The 150-year-old tharavad was beautiful and authentic. Loved the floating tea shop canal ride. The absolute best CGH Earth property.', 'approved'),
('rev-fnm-001', 'hotel-fragrant-nature-munnar', 'Fragrant Nature Munnar', 'u31', 'Kavitha Ram', 'https://i.pravatar.cc/60?img=36', 5, 'The valley view from the bedroom was amazing. Having a real fireplace inside the room during chilly December nights was very romantic. Outstanding hospitality and food.', 'approved'),
('rev-bby-001', 'hotel-brunton-boatyard', 'Brunton Boatyard CGH Earth, Fort Kochi', 'u32', 'David Wilson', 'https://i.pravatar.cc/60?img=15', 5, 'Exceptional heritage stay! Watching ships enter Fort Kochi harbor from the pool side is unforgettable. Sunset cruise was a delight. Historical food menu is super unique.', 'approved'),
('rev-exh-001', 'hotel-elixir-hills', 'Elixir Hills Suites Resort, Munnar', 'u33', 'Ritu Sen', 'https://i.pravatar.cc/60?img=49', 5, 'The largest suites in Munnar! Excellent property nestled right inside a dense forest valley. Infinity pool view is stunning. Staff are incredibly helpful. Top class.', 'approved'),
('rev-nks-001', 'hotel-niraamaya-kovalam', 'Niraamaya Retreats Surya Samudra, Kovalam', 'u34', 'Sarah Connor', 'https://i.pravatar.cc/60?img=28', 5, 'The rock-cut infinity pool hanging over the ocean cliff is magical. Traditional tharavad cottages are beautifully maintained with premium luxury amenities. Ayurveda spa is world-class.', 'approved')
ON CONFLICT (review_id) DO NOTHING;

