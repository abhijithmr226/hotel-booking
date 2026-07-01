import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const SUPABASE_URL = env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const SUPABASE_KEY = env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

console.log('Connecting to Supabase:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const hotels = [
  {
    id: 'hotel-grand-hyatt-kochi',
    name: 'Grand Hyatt Kochi Bolgatty',
    location: 'Bolgatty Island, Kochi',
    district: 'Ernakulam',
    category: 'Luxury Resorts',
    rating: 4.7,
    reviews_count: 1842,
    price: 12600,
    tax: 18,
    image: '/assets/hotels/hotel-grand-hyatt-kochi/main.webp',
    images: [
      '/assets/hotels/hotel-grand-hyatt-kochi/room1.webp',
      '/assets/hotels/hotel-grand-hyatt-kochi/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/CZEvnNYH5zk2Zt5R6',
    whatsapp: '914842661234',
    distance: '8 km from Kochi Airport',
    badge: 'Island Resort',
    description: "Grand Hyatt Kochi Bolgatty is Kerala's most spectacular island luxury resort, perched on the exclusive Bolgatty Island in Vembanad Lake. The 234-room property offers stunning harbour and backwater views, an award-winning spa, six dining venues, and the largest ballroom in Kerala. A private water taxi connects guests to the city.",
    amenities: ['Infinity Pool','Island Location','6 Restaurants & Bars','Grand Spa','Fitness Center','Water Taxi','Banquet Halls','Tennis Court','Kids Club','Free WiFi','Butler Service','Harbour View Rooms','Helipad','Valet Parking'],
    highlights: ['Private island resort on Vembanad Lake','Water taxi to city centre','Largest ballroom in Kerala','Spectacular harbour & backwater views','Celebrity chef dining experiences'],
    details: { 
      checkIn: '3:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Available (Buffet — Rs.1800 per person)', 
      cancellation: 'Free cancellation 24 hours before check-in', 
      phone: '+91 484 266 1234', 
      email: 'kochi.grand@hyatt.com',
      imageAlt: 'Grand Hyatt Kochi Bolgatty exterior luxury island resort on Vembanad Lake',
      roomAlts: [
        'Grand Hyatt Kochi Bolgatty premium guest bedroom room view',
        'Grand Hyatt Kochi Bolgatty grand bathroom suite with bathtub and luxury amenities'
      ]
    },
    nearby: ['Fort Kochi (10 km)','Marine Drive (6 km)','Cochin International Airport (8 km)','Bolgatty Palace (0.5 km)','Chinese Fishing Nets (12 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-crowne-plaza-kochi',
    name: 'Crowne Plaza Kochi',
    location: 'Kundanoor Junction, NH 47 Bypass, Maradu, Kochi',
    district: 'Ernakulam',
    category: 'Business Hotels',
    rating: 4.5,
    reviews_count: 2134,
    price: 6800,
    tax: 18,
    image: '/assets/hotels/hotel-crowne-plaza-kochi/main.webp',
    images: [
      '/assets/hotels/hotel-crowne-plaza-kochi/room1.webp',
      '/assets/hotels/hotel-crowne-plaza-kochi/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/WJYrNv8U4UDWp8QP8',
    whatsapp: '914847115000',
    distance: '12 km from Kochi Airport',
    badge: 'Business Luxury',
    description: "Crowne Plaza Kochi is a premium IHG hotel located on the NH 47 Bypass at Maradu, offering 237 well-appointed rooms with stunning backwater views. Popular with both business and leisure travellers, it features world-class conference facilities, an outdoor pool, an award-winning restaurant Essence, and the stylish Xcessories Bar. Ideal for corporate stays with easy highway access.",
    amenities: ['Outdoor Pool','Fitness Center','Spa','Essence Restaurant','Xcessories Bar','Business Center','6 Conference Halls','Free WiFi','Valet Parking','Airport Shuttle','Concierge','Room Service 24/7','Laundry Service'],
    highlights: ['Backwater & lake view rooms','NH 47 highway frontage — easy access','IHG loyalty rewards','Award-winning Essence restaurant','State-of-the-art conference facilities for up to 1,200 delegates'],
    details: { 
      checkIn: '3:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Available (Rs.850/person)', 
      cancellation: 'Free cancellation 24 hours before check-in', 
      phone: '+91 484 711 5000', 
      email: 'reservations.crowneplazakochi@ihg.com',
      imageAlt: 'Crowne Plaza Kochi main pool and exterior building at Maradu Kundanoor Junction',
      roomAlts: [
        'Crowne Plaza Kochi executive luxury room design',
        'Crowne Plaza Kochi guest suite bedroom and work desk'
      ]
    },
    nearby: ['Vembanad Lake (2 km)','Lulu Mall (8 km)','Marine Drive (10 km)','Cochin Airport (12 km)','Fort Kochi (20 km)'],
    featured: true,
    trending: false,
    status: 'active'
  },
  {
    id: 'hotel-taj-malabar-cochin',
    name: 'Taj Malabar Resort & Spa, Cochin',
    location: 'Willingdon Island, Kochi',
    district: 'Ernakulam',
    category: 'Luxury Resorts',
    rating: 4.8,
    reviews_count: 3267,
    price: 14200,
    tax: 18,
    image: '/assets/hotels/hotel-taj-malabar-cochin/main.webp',
    images: [
      '/assets/hotels/hotel-taj-malabar-cochin/room1.webp',
      '/assets/hotels/hotel-taj-malabar-cochin/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/uX3WUikcVofabs3QA',
    whatsapp: '914846643000',
    distance: '5 km from Kochi City Centre',
    badge: 'Heritage Luxury',
    description: "The Taj Malabar Resort & Spa is Kochi's most iconic luxury property — a heritage masterpiece on Willingdon Island overlooking the Arabian Sea harbour. Originally built in 1935 and completely renovated in 2024, it features 103 elegant rooms, an infinity pool overlooking the backwaters, award-winning Ayurveda spa Jiva, and the legendary Rice Boat Restaurant. Chinese fishing nets are visible from the pool deck.",
    amenities: ['Infinity Pool with Harbour View','Jiva Ayurveda Spa','Rice Boat Restaurant','Harbour Restaurant','Bar','Fitness Centre','Heritage Architecture','Concierge','Valet Parking','Airport Transfer','Business Centre','Free WiFi','Butler Service'],
    highlights: ['Heritage 1935 property with sea & harbour views','Legendary Rice Boat fine dining restaurant','Award-winning Jiva Spa & Ayurveda','Chinese fishing nets view from pool deck','Completely renovated in 2024'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Available', 
      cancellation: 'Free cancellation 24 hours before check-in', 
      phone: '+91 484 664 3000', 
      email: 'malabar.cochin@tajhotels.com',
      imageAlt: 'Taj Malabar Resort & Spa Cochin heritage resort exterior overlooking Arabian Sea',
      roomAlts: [
        'Taj Malabar Resort & Spa Cochin heritage premium guest suite',
        'Taj Malabar Resort & Spa Cochin dining by the waterfront with sunset views'
      ]
    },
    nearby: ['Chinese Fishing Nets (3 km)','Fort Kochi (4 km)','Mattancherry Palace (5 km)','Cochin Airport (12 km)','Jew Town (5 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-postcard-mandalay-hall',
    name: 'The Postcard Mandalay Hall',
    location: 'Fort Kochi, Ernakulam',
    district: 'Ernakulam',
    category: 'Luxury Resorts',
    rating: 4.9,
    reviews_count: 412,
    price: 17500,
    tax: 18,
    image: '/assets/hotels/hotel-postcard-mandalay-hall/main.webp',
    images: [
      '/assets/hotels/hotel-postcard-mandalay-hall/room1.webp',
      '/assets/hotels/hotel-postcard-mandalay-hall/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/iqeVTHrDZYak1V8H8',
    whatsapp: '917999555222',
    distance: '0.5 km from Fort Kochi Ferry',
    badge: 'Ultra Boutique',
    description: "The Postcard Mandalay Hall is Fort Kochi's most exclusive boutique hotel — a lovingly restored 1800s Burmese teak mansion with just 9 curated suites. Each suite is uniquely designed with rare antiques, custom-crafted furniture, and heritage artwork. The property features a heritage courtyard, private library, chef's table dining and bespoke concierge. No two nights are ever the same at Mandalay Hall.",
    amenities: ['9 Unique Heritage Suites','Private Library','Chef Table Dining','Heritage Courtyard','Bespoke Concierge','Curated Art Collection','Antique Decor','Fort Kochi Walking Tours','Bicycle Hire','Cultural Immersion Experiences','Free WiFi','Room Service'],
    highlights: ['Only 9 suites — ultra-exclusive','1800s Burmese teak heritage mansion','Bespoke chef table dining','Curated antique art collection','Walking distance to Fort Kochi heritage sites'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: 'Non-refundable — contact hotel for exceptions', 
      phone: '+91 79995 55222', 
      email: 'book@postcardresorts.com',
      imageAlt: 'The Postcard Mandalay Hall heritage courtyard luxury boutique hotel Fort Kochi',
      roomAlts: [
        'The Postcard Mandalay Hall art-centric luxury guest suite interior',
        'The Postcard Mandalay Hall premium library and lobby area lounge'
      ]
    },
    nearby: ['Chinese Fishing Nets (0.8 km)','St Francis Church (0.5 km)','Mattancherry Palace (2 km)','Fort Kochi Beach (1 km)','Paradesi Synagogue (2.5 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-gokulam-grand-kumarakom',
    name: 'Gokulam Grand Resort and Spa Kumarakom',
    location: 'Athikkalam, Kumarakom, Kottayam',
    district: 'Kottayam',
    category: 'Luxury Resorts',
    rating: 4.6,
    reviews_count: 876,
    price: 13500,
    tax: 18,
    image: '/assets/hotels/hotel-gokulam-grand-kumarakom/main.webp',
    images: [
      '/assets/hotels/hotel-gokulam-grand-kumarakom/room1.webp',
      '/assets/hotels/hotel-gokulam-grand-kumarakom/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/wsRWo8w7UdWqF9Mk8',
    whatsapp: '919288003330',
    distance: '14 km from Kottayam City',
    badge: 'Backwater Luxury',
    description: "Gokulam Grand Resort and Spa Kumarakom is a sprawling lakeside luxury resort on the banks of Vembanad Lake offering breathtaking backwater views. The resort features lake view villas, pool villas, a state-of-the-art Ayurveda spa, an infinity pool overlooking Vembanad, sunset boat cruises, houseboat experiences, and exquisite Kerala cuisine at their lakeside restaurant.",
    amenities: ['Infinity Pool Overlooking Vembanad','Lake View Villas','Pool Villas','Ayurveda Spa','Sunset Boat Cruise','Houseboat Experience','Lakeside Restaurant','Bar','Fitness Center','Yoga Centre','Bird Watching','Shikara Rides','Free WiFi','Airport Transfer'],
    highlights: ['Panoramic Vembanad Lake views','Private pool villas available','Sunset and sunrise shikara rides','Authentic Kerala Ayurveda spa','Kumarakom Bird Sanctuary adjacent'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: 'Free cancellation 48 hours before check-in', 
      phone: '+91 92880 03330', 
      email: 'sales.kmk@gokulamhotels.com',
      imageAlt: 'Gokulam Grand Resort and Spa Kumarakom lakeside pool and resort grounds',
      roomAlts: [
        'Gokulam Grand Resort and Spa Kumarakom premium lakeview suite bedroom',
        'Gokulam Grand Resort and Spa Kumarakom tropical garden cottage exterior'
      ]
    },
    nearby: ['Kumarakom Bird Sanctuary (1 km)','Vembanad Lake (on property)','Kottayam City (14 km)','Alappuzha (30 km)','Kochi Airport (55 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-niraamaya-backwaters-kumarakom',
    name: 'Niraamaya Retreats Backwaters & Beyond',
    location: 'Kumarakom, Kottayam',
    district: 'Kottayam',
    category: 'Ayurveda Resorts',
    rating: 4.8,
    reviews_count: 634,
    price: 13500,
    tax: 18,
    image: '/assets/hotels/hotel-niraamaya-backwaters-kumarakom/main.webp',
    images: [
      '/assets/hotels/hotel-niraamaya-backwaters-kumarakom/room1.webp',
      '/assets/hotels/hotel-niraamaya-backwaters-kumarakom/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/X1DHTHBN816fcK4Y7',
    whatsapp: '914812527700',
    distance: '13 km from Kottayam City',
    badge: 'Wellness Retreat',
    description: "Niraamaya Retreats Backwaters & Beyond is one of Kerala's most celebrated Ayurveda wellness retreats, set amid lush paddy fields and backwater canals in Kumarakom. The retreat offers traditional Kerala Ayurveda therapies with resident doctors, private lake view villas, a tranquil meditation garden, and an organic farm-to-table restaurant. A deeply healing and restorative experience in God's Own Country.",
    amenities: ['Traditional Ayurveda Treatments','Resident Ayurvedic Doctors','Lake View Private Villas','Infinity Pool','Meditation Garden','Yoga Studio','Organic Restaurant','Shikara Rides','Bird Watching','Paddy Field Walks','Cultural Evenings','Free WiFi','Spa'],
    highlights: ['Traditional Kerala Ayurveda with resident doctors','Personalized wellness programs','Lake view private villa retreats','Organic farm-to-table dining','Tranquil paddy field and backwater setting'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included (Full Board Available)', 
      cancellation: 'Free cancellation 72 hours before check-in', 
      phone: '+91 481 252 7700', 
      email: 'reservations@niraamaya.com',
      imageAlt: 'Niraamaya Retreats Backwaters & Beyond Kumarakom lush gardens and wellness paths',
      roomAlts: [
        'Niraamaya Retreats Backwaters & Beyond luxury lake view cottage interior',
        'Niraamaya Retreats Backwaters & Beyond tranquil spa treatment room'
      ]
    },
    nearby: ['Kumarakom Bird Sanctuary (2 km)','Vembanad Lake','Kottayam City (13 km)','Bay Island Driftwood Museum (3 km)','Alappuzha (28 km)'],
    featured: true,
    trending: false,
    status: 'active'
  },
  {
    id: 'hotel-rhythm-kumarakom',
    name: 'Rhythm Kumarakom',
    location: 'Amankari Road, Kumarakom, Kottayam',
    district: 'Kottayam',
    category: 'Luxury Resorts',
    rating: 4.7,
    reviews_count: 523,
    price: 9500,
    tax: 18,
    image: '/assets/hotels/hotel-rhythm-kumarakom/main.webp',
    images: [
      '/assets/hotels/hotel-rhythm-kumarakom/room1.webp',
      '/assets/hotels/hotel-rhythm-kumarakom/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/7ZgUaQq4GygSxNTw7',
    whatsapp: '919072845000',
    distance: '12 km from Kottayam City',
    badge: 'Boutique Backwater',
    description: "Rhythm Kumarakom is a serene boutique resort on the banks of Vembanad Lake, offering an intimate and authentic backwater Kerala experience. The property features lakeview terrace rooms, poolside cottages, plunge pool villas, a lakeside infinity pool, spa, Ayurveda centre, and the Spice Route restaurant serving traditional Kerala cuisine with locally sourced ingredients. 15% discount on direct bookings.",
    amenities: ['Infinity Pool with Lake View','Lakeview Terrace Rooms','Plunge Pool Villas','Poolside Cottages','Spice Route Restaurant','Ayurveda Centre','Spa','Shikara Rides','Sunset Cruises','Yoga','Bird Watching','Cycling','Free WiFi','Parking'],
    highlights: ['Intimate boutique lakefront property','Plunge pool villas for privacy','Sunset shikara rides on Vembanad','Traditional Kerala cuisine at Spice Route','15% discount on direct bookings'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: 'Free cancellation 48 hours before check-in', 
      phone: '+91 90728 45000', 
      email: 'reservations.kum@rhythmhospitality.com',
      imageAlt: 'Rhythm Kumarakom poolside cottages and backwater resort layout',
      roomAlts: [
        'Rhythm Kumarakom lakeview terrace deluxe room interior',
        'Rhythm Kumarakom traditional boat jetty at sunset on Vembanad Lake'
      ]
    },
    nearby: ['Kumarakom Bird Sanctuary (1.5 km)','Vembanad Lake','Kottayam City (12 km)','Alappuzha (28 km)','Kochi Airport (52 km)'],
    featured: false,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-taj-kumarakom',
    name: 'Taj Kumarakom Resort & Spa',
    location: 'Kavanattinkara, Kumarakom, Kottayam',
    district: 'Kottayam',
    category: 'Luxury Resorts',
    rating: 4.9,
    reviews_count: 1456,
    price: 18500,
    tax: 18,
    image: '/assets/hotels/hotel-taj-kumarakom/main.webp',
    images: [
      '/assets/hotels/hotel-taj-kumarakom/room1.webp',
      '/assets/hotels/hotel-taj-kumarakom/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/L9UYzHU27enMeFpH6',
    whatsapp: '914812525711',
    distance: '13 km from Kottayam City',
    badge: 'Top Rated',
    description: "Taj Kumarakom Resort & Spa is the most iconic luxury resort on Vembanad Lake — a collection of 26-acre heritage estate cottages and private pool villas seamlessly blending into the surrounding backwater landscape. The Jiva Spa offers world-class Kerala Ayurveda, while the restaurant serves legendary Keralan and international cuisine. Rated as one of the best resort experiences in Asia.",
    amenities: ['26-Acre Heritage Estate','Private Pool Villas','Jiva Spa & Ayurveda','Multiple Restaurants','Infinity Pool','Backwater Dining','Sunset Cruise','Shikara Rides','Yoga Pavilion','Bird Watching','Cycling','Tennis Court','Concierge','Airport Transfer','Butler Service','Free WiFi'],
    highlights: ['26-acre estate on Vembanad Lake','Private pool villas with lake access','Award-winning Jiva Spa','Legendary Keralan and international cuisine','Consistently ranked among Asia best resorts'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: 'Free cancellation 48 hours before check-in', 
      phone: '+91 481 252 5711', 
      email: 'kumarakom.taj@tajhotels.com',
      imageAlt: 'Taj Kumarakom Resort & Spa traditional heritage estate bungalow on Vembanad Lake',
      roomAlts: [
        'Taj Kumarakom Resort & Spa lake view heritage cottage bedroom',
        'Taj Kumarakom Resort & Spa private plunge pool villa patio'
      ]
    },
    nearby: ['Kumarakom Bird Sanctuary (1 km)','Vembanad Lake (on property)','Kottayam City (13 km)','Bay Island Museum (5 km)','Alappuzha (30 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-uday-backwater-alappuzha',
    name: 'Uday Backwater Resort',
    location: 'Punnamada Lake, Alappuzha',
    district: 'Alappuzha',
    category: 'Beach Resorts', // Or we can use "Luxury Resorts" since it is a premium backwater resort, but Alappuzha is famous for backwaters / beach. Beach Resorts is fine.
    rating: 4.5,
    reviews_count: 789,
    price: 6500,
    tax: 12,
    image: '/assets/hotels/hotel-uday-backwater-alappuzha/main.webp',
    images: [
      '/assets/hotels/hotel-uday-backwater-alappuzha/room1.webp',
      '/assets/hotels/hotel-uday-backwater-alappuzha/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/S5uQXrxt5AL9QGb6A',
    whatsapp: '919387217501',
    distance: '4 km from Alappuzha Town',
    badge: 'Backwater View',
    description: "Uday Backwater Resort is a beautifully appointed property on the banks of Punnamada Lake in Alappuzha — the famous Venice of the East. The resort features lake view deluxe rooms, pool villas, an outdoor pool overlooking the backwaters, an Ayurveda centre, and the lakeside Anjana Restaurant serving fresh Kerala seafood. The starting point for the famous Alappuzha-Kollam backwater cruise.",
    amenities: ['Outdoor Pool with Lake View','Lake View Deluxe Rooms','Pool Villas','Anjana Restaurant (Lakeside)','Ayurveda Centre','Shikara Rides','Backwater Cruise','Houseboat Access','Canoe Rides','Fishing','Yoga','Free WiFi','Parking','Room Service'],
    highlights: ['On the banks of Punnamada Lake','Alappuzha-Kollam cruise access','Fresh Kerala seafood at Anjana Restaurant','Pool villa with private lake view','Boat races viewpoint during Nehru Trophy season'],
    details: { 
      checkIn: '12:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: 'Free cancellation 48 hours before check-in', 
      phone: '+91 93872 17501', 
      email: 'reservations@udshotels.com',
      imageAlt: 'Uday Backwater Resort Punnamada lakefront layout with boats in Alappuzha',
      roomAlts: [
        'Uday Backwater Resort lake view deluxe room interior',
        'Uday Backwater Resort lakeside swimming pool and deck'
      ]
    },
    nearby: ['Punnamada Lake (on property)','Alappuzha Beach (4 km)','Nehru Trophy Boat Race venue','Krishnapuram Palace (14 km)','Marari Beach (12 km)'],
    featured: true,
    trending: true,
    status: 'active'
  }
];

const rooms = [
  // Grand Hyatt Kochi
  { id: 'room-ghk-001', hotel_id: 'hotel-grand-hyatt-kochi', hotel_name: 'Grand Hyatt Kochi Bolgatty', room_number: '101', type: 'Deluxe King Room', capacity: 2, price: 12600, beds: 1, availability: 'available', amenities: ["King Bed","Harbour View","AC","Free WiFi","Smart TV","Minibar","Safe","Bathtub","Rain Shower"], inventory: 30 },
  { id: 'room-ghk-002', hotel_id: 'hotel-grand-hyatt-kochi', hotel_name: 'Grand Hyatt Kochi Bolgatty', room_number: '201', type: 'Grand Suite', capacity: 2, price: 22000, beds: 1, availability: 'available', amenities: ["King Bed","Private Balcony","Harbour & Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Butler Service"], inventory: 10 },
  { id: 'room-ghk-003', hotel_id: 'hotel-grand-hyatt-kochi', hotel_name: 'Grand Hyatt Kochi Bolgatty', room_number: '301', type: 'Family Room', capacity: 4, price: 18000, beds: 2, availability: 'available', amenities: ["2 Queen Beds","Backwater View","AC","Free WiFi","Smart TV","Kids Amenities","Bathtub"], inventory: 15 },
  
  // Crowne Plaza Kochi
  { id: 'room-cpk-001', hotel_id: 'hotel-crowne-plaza-kochi', hotel_name: 'Crowne Plaza Kochi', room_number: '101', type: 'Superior Room', capacity: 2, price: 6800, beds: 1, availability: 'available', amenities: ["King Bed","City or Lake View","AC","Free WiFi","Smart TV","Work Desk","Minibar","Rain Shower"], inventory: 50 },
  { id: 'room-cpk-002', hotel_id: 'hotel-crowne-plaza-kochi', hotel_name: 'Crowne Plaza Kochi', room_number: '201', type: 'Club Room', capacity: 2, price: 9500, beds: 1, availability: 'available', amenities: ["King Bed","Club Lounge Access","Backwater View","AC","Free WiFi","Smart TV","Minibar","Bathtub","Evening Cocktails"], inventory: 20 },
  { id: 'room-cpk-003', hotel_id: 'hotel-crowne-plaza-kochi', hotel_name: 'Crowne Plaza Kochi', room_number: '301', type: 'Junior Suite', capacity: 2, price: 13500, beds: 1, availability: 'available', amenities: ["King Bed","Separate Living Area","Backwater View","Jacuzzi","AC","Smart TV","Minibar","Butler Service"], inventory: 8 },
  
  // Taj Malabar Resort & Spa
  { id: 'room-tmr-001', hotel_id: 'hotel-taj-malabar-cochin', hotel_name: 'Taj Malabar Resort & Spa, Cochin', room_number: '101', type: 'Superior Heritage Room', capacity: 2, price: 14200, beds: 1, availability: 'available', amenities: ["King Bed","Harbour View","Heritage Decor","AC","Free WiFi","Smart TV","Minibar","Rain Shower","Taj Branded Toiletries"], inventory: 20 },
  { id: 'room-tmr-002', hotel_id: 'hotel-taj-malabar-cochin', hotel_name: 'Taj Malabar Resort & Spa, Cochin', room_number: '201', type: 'Harbour View Suite', capacity: 2, price: 24000, beds: 1, availability: 'available', amenities: ["King Bed","Full Harbour View","Private Balcony","Living Room","Jacuzzi","Butler Service","AC","Smart TV","Minibar"], inventory: 6 },
  { id: 'room-tmr-003', hotel_id: 'hotel-taj-malabar-cochin', hotel_name: 'Taj Malabar Resort & Spa, Cochin', room_number: '301', type: 'Pool Suite', capacity: 2, price: 32000, beds: 1, availability: 'available', amenities: ["King Bed","Private Plunge Pool","Sea View","Outdoor Terrace","Butler Service","Jacuzzi","Minibar","Smart TV"], inventory: 4 },
  
  // Postcard Mandalay Hall
  { id: 'room-pmh-001', hotel_id: 'hotel-postcard-mandalay-hall', hotel_name: 'The Postcard Mandalay Hall', room_number: 'MS1', type: 'Heritage Suite', capacity: 2, price: 17500, beds: 1, availability: 'available', amenities: ["King Bed","Antique Decor","Heritage Architecture","AC","Free WiFi","Premium Toiletries","Private Courtyard View","Bespoke Amenities"], inventory: 5 },
  { id: 'room-pmh-002', hotel_id: 'hotel-postcard-mandalay-hall', hotel_name: 'The Postcard Mandalay Hall', room_number: 'MS2', type: 'Grand Heritage Suite', capacity: 2, price: 25000, beds: 1, availability: 'available', amenities: ["King Bed","Rare Antiques","Private Sitting Room","Curated Art Pieces","AC","Free WiFi","Chef Table Dining Access","Premium Toiletries"], inventory: 4 },
  
  // Gokulam Grand Kumarakom
  { id: 'room-ggk-001', hotel_id: 'hotel-gokulam-grand-kumarakom', hotel_name: 'Gokulam Grand Resort and Spa Kumarakom', room_number: '101', type: 'Deluxe Lake View Room', capacity: 2, price: 13500, beds: 1, availability: 'available', amenities: ["King Bed","Vembanad Lake View","AC","Free WiFi","Smart TV","Minibar","Bathtub","Rain Shower"], inventory: 25 },
  { id: 'room-ggk-002', hotel_id: 'hotel-gokulam-grand-kumarakom', hotel_name: 'Gokulam Grand Resort and Spa Kumarakom', room_number: '201', type: 'Lake View Villa', capacity: 2, price: 22000, beds: 1, availability: 'available', amenities: ["King Bed","Private Terrace","Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Outdoor Shower"], inventory: 10 },
  { id: 'room-ggk-003', hotel_id: 'hotel-gokulam-grand-kumarakom', hotel_name: 'Gokulam Grand Resort and Spa Kumarakom', room_number: '301', type: 'Pool Villa', capacity: 2, price: 28000, beds: 1, availability: 'available', amenities: ["King Bed","Private Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Minibar","Butler Service"], inventory: 5 },
  
  // Niraamaya Retreats
  { id: 'room-nrk-001', hotel_id: 'hotel-niraamaya-backwaters-kumarakom', hotel_name: 'Niraamaya Retreats Backwaters & Beyond', room_number: 'GV1', type: 'Garden Villa', capacity: 2, price: 13500, beds: 1, availability: 'available', amenities: ["King Bed","Garden View","AC","Free WiFi","Smart TV","Ayurveda Toiletries","Rain Shower","Private Deck"], inventory: 8 },
  { id: 'room-nrk-002', hotel_id: 'hotel-niraamaya-backwaters-kumarakom', hotel_name: 'Niraamaya Retreats Backwaters & Beyond', room_number: 'LV1', type: 'Lake View Villa', capacity: 2, price: 18000, beds: 1, availability: 'available', amenities: ["King Bed","Lake View","Private Deck","AC","Free WiFi","Smart TV","Bathtub","Ayurveda Welcome Pack"], inventory: 6 },
  { id: 'room-nrk-003', hotel_id: 'hotel-niraamaya-backwaters-kumarakom', hotel_name: 'Niraamaya Retreats Backwaters & Beyond', room_number: 'PV1', type: 'Pool Villa', capacity: 2, price: 26000, beds: 1, availability: 'available', amenities: ["King Bed","Private Pool","Panoramic Lake View","Living Room","Butler Service","Jacuzzi","AC","Smart TV"], inventory: 3 },
  
  // Rhythm Kumarakom
  { id: 'room-rkm-001', hotel_id: 'hotel-rhythm-kumarakom', hotel_name: 'Rhythm Kumarakom', room_number: '101', type: 'Lakeview Terrace Room', capacity: 2, price: 9500, beds: 1, availability: 'available', amenities: ["King Bed","Vembanad Lake View","Private Terrace","AC","Free WiFi","Smart TV","Minibar","Rain Shower"], inventory: 10 },
  { id: 'room-rkm-002', hotel_id: 'hotel-rhythm-kumarakom', hotel_name: 'Rhythm Kumarakom', room_number: '201', type: 'Poolside Cottage', capacity: 2, price: 14500, beds: 1, availability: 'available', amenities: ["King Bed","Pool Access","Garden View","Private Patio","AC","Free WiFi","Smart TV","Outdoor Shower"], inventory: 6 },
  { id: 'room-rkm-003', hotel_id: 'hotel-rhythm-kumarakom', hotel_name: 'Rhythm Kumarakom', room_number: '301', type: 'Plunge Pool Villa', capacity: 2, price: 19500, beds: 1, availability: 'available', amenities: ["King Bed","Private Plunge Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Butler Service"], inventory: 4 },
  
  // Taj Kumarakom
  { id: 'room-tkr-001', hotel_id: 'hotel-taj-kumarakom', hotel_name: 'Taj Kumarakom Resort & Spa', room_number: '101', type: 'Lake View Cottage', capacity: 2, price: 18500, beds: 1, availability: 'available', amenities: ["King Bed","Vembanad Lake View","Heritage Cottage","Private Deck","AC","Free WiFi","Smart TV","Minibar","Bathtub","Taj Toiletries"], inventory: 15 },
  { id: 'room-tkr-002', hotel_id: 'hotel-taj-kumarakom', hotel_name: 'Taj Kumarakom Resort & Spa', room_number: '201', type: 'Luxury Cottage', capacity: 2, price: 24500, beds: 1, availability: 'available', amenities: ["King Bed","Garden & Lake View","Private Outdoor Shower","Living Room","AC","Smart TV","Minibar","Butler Service","Jacuzzi"], inventory: 8 },
  { id: 'room-tkr-003', hotel_id: 'hotel-taj-kumarakom', hotel_name: 'Taj Kumarakom Resort & Spa', room_number: '301', type: 'Private Pool Villa', capacity: 2, price: 35000, beds: 1, availability: 'available', amenities: ["King Bed","Private Infinity Pool","Panoramic Lake View","Living & Dining Room","Jacuzzi","Butler Service","AC","Smart TV","Premium Minibar"], inventory: 4 },
  
  // Uday Backwater Resort
  { id: 'room-ubr-001', hotel_id: 'hotel-uday-backwater-alappuzha', hotel_name: 'Uday Backwater Resort', room_number: '101', type: 'Lake View Deluxe Room', capacity: 2, price: 6500, beds: 1, availability: 'available', amenities: ["King Bed","Punnamada Lake View","AC","Free WiFi","Smart TV","Minibar","Rain Shower","Private Balcony"], inventory: 20 },
  { id: 'room-ubr-002', hotel_id: 'hotel-uday-backwater-alappuzha', hotel_name: 'Uday Backwater Resort', room_number: '201', type: 'Elite Room', capacity: 2, price: 9500, beds: 1, availability: 'available', amenities: ["King Bed","Extended Lake View","AC","Free WiFi","Smart TV","Minibar","Bathtub","In-room Dining"], inventory: 10 },
  { id: 'room-ubr-003', hotel_id: 'hotel-uday-backwater-alappuzha', hotel_name: 'Uday Backwater Resort', room_number: '301', type: 'Pool Villa', capacity: 2, price: 15000, beds: 1, availability: 'available', amenities: ["King Bed","Private Pool","Lake View","Living Room","Jacuzzi","AC","Smart TV","Butler Service"], inventory: 4 }
];

const reviews = [
  { review_id: 'rev-021', hotel_id: 'hotel-grand-hyatt-kochi', hotel_name: 'Grand Hyatt Kochi Bolgatty', user_id: 'u21', user_name: 'Aishwarya Menon', user_photo: 'https://i.pravatar.cc/60?img=47', rating: 5, comment: 'The water taxi to the island at night was absolutely magical — like arriving in a dream. Room views over Vembanad Lake are breathtaking. The pool and spa are world-class. Best hotel experience in Kerala hands down!', status: 'approved' },
  { review_id: 'rev-022', hotel_id: 'hotel-crowne-plaza-kochi', hotel_name: 'Crowne Plaza Kochi', user_id: 'u22', user_name: 'Suresh Varma', user_photo: 'https://i.pravatar.cc/60?img=33', rating: 4, comment: 'Excellent business hotel with outstanding conference facilities. The Essence restaurant has some of the best buffet spread I have seen in Kerala. Room was spacious and well-maintained. Pool area is lovely with backwater views.', status: 'approved' },
  { review_id: 'rev-023', hotel_id: 'hotel-taj-malabar-cochin', hotel_name: 'Taj Malabar Resort & Spa, Cochin', user_id: 'u23', user_name: 'Preethi Nair', user_photo: 'https://i.pravatar.cc/60?img=23', rating: 5, comment: 'Stayed in the Harbour View Suite — watching ships pass the Chinese fishing nets from my window was surreal. The Rice Boat restaurant deserves a Michelin star. Post-renovation the rooms are stunning. Jiva Spa is world-class.', status: 'approved' },
  { review_id: 'rev-024', hotel_id: 'hotel-postcard-mandalay-hall', hotel_name: 'The Postcard Mandalay Hall', user_id: 'u24', user_name: 'Rohan Mathew', user_photo: 'https://i.pravatar.cc/60?img=12', rating: 5, comment: 'An unmatched boutique experience. The 1800s teak mansion is authentically preserved. Each suite feels like a personal gallery. Chef table dinner was a highlight of our entire Kerala trip. Absolutely worth the price.', status: 'approved' },
  { review_id: 'rev-025', hotel_id: 'hotel-gokulam-grand-kumarakom', hotel_name: 'Gokulam Grand Resort and Spa Kumarakom', user_id: 'u25', user_name: 'Divya Krishnan', user_photo: 'https://i.pravatar.cc/60?img=43', rating: 5, comment: 'The pool villa with private lake view was extraordinary. Woke up to birds flying over Vembanad Lake every morning. The Ayurveda spa treatments were excellent. Sunset shikara ride was the most romantic moment of our trip!', status: 'approved' },
  { review_id: 'rev-026', hotel_id: 'hotel-niraamaya-backwaters-kumarakom', hotel_name: 'Niraamaya Retreats Backwaters & Beyond', user_id: 'u26', user_name: 'Dr. Sreejith Kumar', user_photo: 'https://i.pravatar.cc/60?img=18', rating: 5, comment: 'Came for a 7-day Panchakarma retreat. The resident Ayurvedic doctor was brilliant — my customised treatment plan made a real difference to my health. The villas are stunning and the organic food is therapeutic. Will be back.', status: 'approved' },
  { review_id: 'rev-027', hotel_id: 'hotel-rhythm-kumarakom', hotel_name: 'Rhythm Kumarakom', user_id: 'u27', user_name: 'Anitha George', user_photo: 'https://i.pravatar.cc/60?img=38', rating: 4, comment: 'Smaller and more intimate than the big Kumarakom resorts — which is exactly what we wanted. The plunge pool villa had the most beautiful lake view. Spice Route restaurant food was exceptional Kerala home cooking. Great value!', status: 'approved' },
  { review_id: 'rev-028', hotel_id: 'hotel-taj-kumarakom', hotel_name: 'Taj Kumarakom Resort & Spa', user_id: 'u28', user_name: 'Vijay Anand', user_photo: 'https://i.pravatar.cc/60?img=56', rating: 5, comment: 'The private pool villa directly on Vembanad Lake is a once in a lifetime experience. Woke up to elephants bathing in the lake! The 26-acre estate feels like your own private Kerala paradise. Jiva Spa is transformative.', status: 'approved' },
  { review_id: 'rev-029', hotel_id: 'hotel-uday-backwater-alappuzha', hotel_name: 'Uday Backwater Resort', user_id: 'u29', user_name: 'Meera Thomas', user_photo: 'https://i.pravatar.cc/60?img=22', rating: 4, comment: 'Great value resort in Alleppey with beautiful Punnamada Lake views. The shikara ride at sunset was magical. Anjana restaurant serves fresh Kerala fish curry that is the best I have had anywhere. Perfect base for backwater exploration!', status: 'approved' }
];

async function main() {
  console.log('🏨 Upserting 9 hotels...');
  const { error: hErr } = await supabase.from('hotels').upsert(hotels, { onConflict: 'id' });
  if (hErr) {
    console.error('❌ Hotels insert error:', hErr.message);
    process.exit(1);
  }
  console.log('✅ 9 hotels upserted.');

  console.log('🛏️ Upserting rooms...');
  const { error: rErr } = await supabase.from('rooms').upsert(rooms, { onConflict: 'id' });
  if (rErr) {
    console.error('❌ Rooms insert error:', rErr.message);
    process.exit(1);
  }
  console.log('✅ Rooms upserted.');

  console.log('⭐ Upserting reviews...');
  const { error: revErr } = await supabase.from('reviews').upsert(reviews, { onConflict: 'review_id' });
  if (revErr) {
    console.error('❌ Reviews insert error:', revErr.message);
    process.exit(1);
  }
  console.log('✅ Reviews upserted.');

  console.log('\n🎉 Successfully inserted/updated all 9 hotels, rooms, and reviews into Supabase!');
}

main().catch(console.error);
