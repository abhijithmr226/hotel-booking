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
    id: 'hotel-coconut-lagoon',
    name: 'Coconut Lagoon CGH Earth, Kumarakom',
    location: 'Kumarakom, Kottayam',
    district: 'Kottayam',
    category: 'Luxury Resorts',
    rating: 4.8,
    reviews_count: 1432,
    price: 18500,
    tax: 18,
    image: '/assets/hotels/hotel-coconut-lagoon/main.webp',
    images: [
      '/assets/hotels/hotel-coconut-lagoon/room1.webp',
      '/assets/hotels/hotel-coconut-lagoon/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/tJ9D2tN2z67G8yT8',
    whatsapp: '914812528200',
    distance: '14 km from Kottayam City',
    badge: 'Eco Luxury',
    description: "Coconut Lagoon is a celebrated heritage resort accessible only by boat, set in a sheltered cove on Vembanad Lake. The resort features restored 150-year-old traditional Keralan mansions (tharavads), a canal networks pool, butterfly garden, and floating tea shops. Experience authentic Kerala with sustainable practices.",
    amenities: ['Lakeside Pool','Heritage Mansions','Canal Vibe','Sunset Shikara Cruise','Butterfly Garden','Ayurveda Centre','Yoga Pavilion','Organic Farm','Bird Watching','Free WiFi','Air Conditioning','Keralan Restaurant'],
    highlights: ['Only accessible by boat','Restored 150-year-old tharavads','Sustainable eco-certified property','Vembanad Lake sunset cruises'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '72 hours free cancellation', 
      phone: '+91 481 252 8200', 
      email: 'coconutlagoon@cghearth.com',
      imageAlt: 'Coconut Lagoon CGH Earth traditional lake resort on Vembanad Lake',
      roomAlts: [
        'Coconut Lagoon heritage guest bungalow room layout',
        'Coconut Lagoon natural pool deck area'
      ]
    },
    nearby: ['Kumarakom Bird Sanctuary (1.5 km)','Vembanad Lake','Bay Island Driftwood Museum (4 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-fragrant-nature-munnar',
    name: 'Fragrant Nature Munnar',
    location: 'Bison Valley Road, Munnar',
    district: 'Idukki',
    category: 'Hill Station Hotels',
    rating: 4.7,
    reviews_count: 986,
    price: 8200,
    tax: 12,
    image: '/assets/hotels/hotel-fragrant-nature-munnar/main.webp',
    images: [
      '/assets/hotels/hotel-fragrant-nature-munnar/room1.webp',
      '/assets/hotels/hotel-fragrant-nature-munnar/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/g69fVshgR2pGgS6p9',
    whatsapp: '914865230005',
    distance: '6 km from Munnar Town',
    badge: 'Misty View',
    description: "Fragrant Nature Munnar offers premium luxury rooms with fireplaces and private balconies overlooking the misty Bison Valley tea hills. Features the highest-altitude restaurant in Munnar, a luxury spa, and guided spice garden trails. Perfect romantic escape in the high ranges.",
    amenities: ['Room Fireplace','Panoramic Spa','Bison Valley View','Glass House Café','Gym','Trekking Club','Kids Play Area','Free WiFi','Valet Parking','Laundry Service'],
    highlights: ['In-room fireplaces for chilly nights','Tea plantation views from all rooms','Highest fine dining deck in Munnar','Guided Bison Valley valley walks'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '48 hours free cancellation', 
      phone: '+91 4865 230 005', 
      email: 'reservations.mnr@fragrantnature.com',
      imageAlt: 'Fragrant Nature Munnar luxury hillside resort overlooking misty tea gardens',
      roomAlts: [
        'Fragrant Nature luxury suite room interior with fireplace',
        'Fragrant Nature high-altitude deck view'
      ]
    },
    nearby: ['Munnar Tea Museum (8 km)','Eravikulam National Park (14 km)','Anamudi Peak (15 km)'],
    featured: true,
    trending: false,
    status: 'active'
  },
  {
    id: 'hotel-brunton-boatyard',
    name: 'Brunton Boatyard CGH Earth, Fort Kochi',
    location: 'Calvathy Road, Fort Kochi, Kochi',
    district: 'Ernakulam',
    category: 'Heritage Hotels',
    rating: 4.8,
    reviews_count: 1124,
    price: 15500,
    tax: 18,
    image: '/assets/hotels/hotel-brunton-boatyard/main.webp',
    images: [
      '/assets/hotels/hotel-brunton-boatyard/room1.webp',
      '/assets/hotels/hotel-brunton-boatyard/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/W1DHTHBN816fcK4Y7',
    whatsapp: '914842215461',
    distance: '0.8 km from Fort Kochi Beach',
    badge: 'Heritage Luxury',
    description: "Brunton Boatyard is a beautifully restored heritage hotel built on the remains of a 19th-century Victorian shipbuilding yard. Overlooking the busy shipping channel, it offers rooms with views of passing container ships and Chinese fishing nets. Features historical cuisine blending Dutch, Portuguese, and Keralan influences.",
    amenities: ['Harbour View Pool','Historical Dining','Armory Bar','Sunset Boat Cruise','Ayurveda Centre','Bicycle Hire','Free WiFi','Air Conditioning','Heritage Library','Concierge'],
    highlights: ['Built on a historical 19th-century boatyard','Chinese fishing nets visible from rooms','Sunset harbour cruises included','Historic fusion culinary experiences'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: '72 hours free cancellation', 
      phone: '+91 484 221 5461', 
      email: 'bruntonboatyard@cghearth.com',
      imageAlt: 'Brunton Boatyard CGH Earth historic hotel on Fort Kochi harbour front',
      roomAlts: [
        'Brunton Boatyard colonial style guest bedroom',
        'Brunton Boatyard pool overlooking Fort Kochi harbour'
      ]
    },
    nearby: ['Chinese Fishing Nets (0.2 km)','St. Francis Church (0.4 km)','Mattancherry Spice Market (2.5 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-elixir-hills',
    name: 'Elixir Hills Suites Resort, Munnar',
    location: 'Near Letchmi Estate, Mankulam, Munnar',
    district: 'Idukki',
    category: 'Luxury Resorts',
    rating: 4.9,
    reviews_count: 854,
    price: 9800,
    tax: 12,
    image: '/assets/hotels/hotel-elixir-hills/main.webp',
    images: [
      '/assets/hotels/hotel-elixir-hills/room1.webp',
      '/assets/hotels/hotel-elixir-hills/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/G6qWdYhHnJtzt3tZ9',
    whatsapp: '919495000523',
    distance: '12 km from Munnar Town',
    badge: 'Rainforest Luxury',
    description: "Elixir Hills is Munnar's largest suite-only luxury resort, hidden in the dense rainforest of Letchmi Hills. Features expansive suites with private balconies overlooking spice plantations and jungle streams. It has an outdoor pool, spa, and a natural forest trekking club.",
    amenities: ['Large Suites Only','Infinity Forest Pool','Rainforest Trekking','Ayurveda Spa','Kids Activity Hub','Multi-cuisine Restaurant','Coffee Lounge','Free WiFi','Valet Parking','Jeep Safaris'],
    highlights: ['Largest luxury suites in Munnar','Surrounded by dense Letchmi rainforest','Infinity pool hanging over the jungle valley','Guided stream walks and birdwatching hikes'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '48 hours free cancellation', 
      phone: '+91 94950 00523', 
      email: 'reservations@elixirhills.com',
      imageAlt: 'Elixir Hills Suites Resort infinity pool hanging over the Munnar forest valley',
      roomAlts: [
        'Elixir Hills expansive guest suite living room',
        'Elixir Hills luxury bedroom with private forest balcony'
      ]
    },
    nearby: ['Letchmi Hills Trekking (0.5 km)','Mankulam Elephant Watching (10 km)','Munnar Town (12 km)'],
    featured: true,
    trending: true,
    status: 'active'
  },
  {
    id: 'hotel-niraamaya-kovalam',
    name: 'Niraamaya Retreats Surya Samudra, Kovalam',
    location: 'Pulinkudi, Mullur, Kovalam, Trivandrum',
    district: 'Thiruvananthapuram',
    category: 'Ayurveda Resorts',
    rating: 4.9,
    reviews_count: 1045,
    price: 16800,
    tax: 18,
    image: '/assets/hotels/hotel-niraamaya-kovalam/main.webp',
    images: [
      '/assets/hotels/hotel-niraamaya-kovalam/room1.webp',
      '/assets/hotels/hotel-niraamaya-kovalam/room2.webp'
    ],
    map_url: 'https://maps.app.goo.gl/PzB6x1GzZq47m8rC8',
    whatsapp: '914712481575',
    distance: '8 km from Kovalam Beach',
    badge: 'Cliffside Luxury',
    description: "Niraamaya Surya Samudra is a dramatic cliffside resort in Kovalam overlooking the Arabian Sea, featuring traditional Keralan heritage cottages. The multi-award-winning Niraamaya Spa offers authentic Ayurveda programs. Features a spectacular cliffside infinity pool carved out of rock.",
    amenities: ['Cliff-edge Infinity Pool','Traditional Tharavads','Direct Beach Access','Multi-award Spa','Sea View Dining','Yoga Pavilion','Meditation Gardens','Ayurveda Programs','Free WiFi','Valet Parking'],
    highlights: ['Clifftop tharavad cottages overlooking sea','Infinity pool carved into cliffside rock','Direct private beach access pathways','Multi-award-winning international spa and Ayurveda programs'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '72 hours free cancellation', 
      phone: '+91 471 248 1575', 
      email: 'suryasamudra@niraamaya.com',
      imageAlt: 'Niraamaya Retreats Surya Samudra clifftop infinity pool and Arabian Sea view in Kovalam',
      roomAlts: [
        'Niraamaya Surya Samudra premium Keralan heritage cottage bedroom',
        'Niraamaya Surya Samudra outdoor sea-view bath area'
      ]
    },
    nearby: ['Lighthouse Beach Kovalam (8 km)','Vizhinjam Marine Aquarium (6 km)','Trivandrum Airport (22 km)'],
    featured: true,
    trending: true,
    status: 'active'
  }
];

const rooms = [
  // Coconut Lagoon
  { id: 'room-cl-001', hotel_id: 'hotel-coconut-lagoon', hotel_name: 'Coconut Lagoon CGH Earth, Kumarakom', room_number: '101', type: 'Heritage Mansion', capacity: 2, price: 18500, beds: 1, availability: 'available', amenities: ["King Bed","Heritage Tharavad","AC","Free WiFi","Minibar","Outdoor Shower","Tea Maker"], inventory: 20 },
  { id: 'room-cl-002', hotel_id: 'hotel-coconut-lagoon', hotel_name: 'Coconut Lagoon CGH Earth, Kumarakom', room_number: '201', type: 'Private Pool Villa', capacity: 2, price: 28000, beds: 1, availability: 'available', amenities: ["King Bed","Private Pool","Lake View","Living Area","AC","Minibar","Butler Service"], inventory: 6 },
  
  // Fragrant Nature Munnar
  { id: 'room-fnm-001', hotel_id: 'hotel-fragrant-nature-munnar', hotel_name: 'Fragrant Nature Munnar', room_number: '101', type: 'Tropic Green Room', capacity: 2, price: 8200, beds: 1, availability: 'available', amenities: ["King Bed","Bison Valley View","AC","Free WiFi","Smart TV","Minibar","Fireplace"], inventory: 15 },
  { id: 'room-fnm-002', hotel_id: 'hotel-fragrant-nature-munnar', hotel_name: 'Fragrant Nature Munnar', room_number: '201', type: 'Moonlight Suite', capacity: 2, price: 12500, beds: 1, availability: 'available', amenities: ["King Bed","Valley View Balcony","Jacuzzi","Fireplace","AC","Smart TV","Minibar"], inventory: 8 },

  // Brunton Boatyard
  { id: 'room-bb-001', hotel_id: 'hotel-brunton-boatyard', hotel_name: 'Brunton Boatyard CGH Earth, Fort Kochi', room_number: '101', type: 'Sea Facing Room', capacity: 2, price: 15500, beds: 1, availability: 'available', amenities: ["King Bed","Harbour & Sea View","Colonial Decor","AC","Free WiFi","Minibar","Bathtub"], inventory: 22 },
  { id: 'room-bb-002', hotel_id: 'hotel-brunton-boatyard', hotel_name: 'Brunton Boatyard CGH Earth, Fort Kochi', room_number: '201', type: 'Deluxe Suite', capacity: 2, price: 24000, beds: 1, availability: 'available', amenities: ["King Bed","Panaromic Sea View","Living Room","Private Balcony","Butler Service","AC","Minibar"], inventory: 4 },

  // Elixir Hills
  { id: 'room-eh-001', hotel_id: 'hotel-elixir-hills', hotel_name: 'Elixir Hills Suites Resort, Munnar', room_number: '101', type: 'Deluxe Suite', capacity: 2, price: 9800, beds: 1, availability: 'available', amenities: ["King Bed","Forest View","AC","Free WiFi","Smart TV","Minibar","Sofa Seating","Rain Shower"], inventory: 30 },
  { id: 'room-eh-002', hotel_id: 'hotel-elixir-hills', hotel_name: 'Elixir Hills Suites Resort, Munnar', room_number: '201', type: 'Jacuzzi Suite Pool View', capacity: 2, price: 15000, beds: 1, availability: 'available', amenities: ["King Bed","In-room Jacuzzi","Pool & Valley View","AC","Smart TV","Minibar","Butler Service"], inventory: 10 },

  // Niraamaya Kovalam
  { id: 'room-nks-001', hotel_id: 'hotel-niraamaya-kovalam', hotel_name: 'Niraamaya Retreats Surya Samudra, Kovalam', room_number: '101', type: 'Rock Garden Heritage Room', capacity: 2, price: 16800, beds: 1, availability: 'available', amenities: ["King Bed","Heritage Tharavad","AC","Free WiFi","Open-to-Sky Bath","Private Garden Deck","Safe"], inventory: 12 },
  { id: 'room-nks-002', hotel_id: 'hotel-niraamaya-kovalam', hotel_name: 'Niraamaya Retreats Surya Samudra, Kovalam', room_number: '201', type: 'Octagon Sea View Villa', capacity: 2, price: 27000, beds: 1, availability: 'available', amenities: ["King Bed","Panoramic Sea View","Octagonal Design","AC","Free WiFi","Sundeck","Butler Service"], inventory: 4 }
];

const reviews = [
  { review_id: 'rev-cgl-001', hotel_id: 'hotel-coconut-lagoon', hotel_name: 'Coconut Lagoon CGH Earth, Kumarakom', user_id: 'u30', user_name: 'Harish Nair', user_photo: 'https://i.pravatar.cc/60?img=11', rating: 5, comment: 'Arriving by boat sets the perfect mood. The 150-year-old tharavad was beautiful and authentic. Loved the floating tea shop canal ride. The absolute best CGH Earth property.', status: 'approved' },
  { review_id: 'rev-fnm-001', hotel_id: 'hotel-fragrant-nature-munnar', hotel_name: 'Fragrant Nature Munnar', user_id: 'u31', user_name: 'Kavitha Ram', user_photo: 'https://i.pravatar.cc/60?img=36', rating: 5, comment: 'The valley view from the bedroom was amazing. Having a real fireplace inside the room during chilly December nights was very romantic. Outstanding hospitality and food.', status: 'approved' },
  { review_id: 'rev-bby-001', hotel_id: 'hotel-brunton-boatyard', hotel_name: 'Brunton Boatyard CGH Earth, Fort Kochi', user_id: 'u32', user_name: 'David Wilson', user_photo: 'https://i.pravatar.cc/60?img=15', rating: 5, comment: 'Exceptional heritage stay! Watching ships enter Fort Kochi harbor from the pool side is unforgettable. Sunset cruise was a delight. Historical food menu is super unique.', status: 'approved' },
  { review_id: 'rev-exh-001', hotel_id: 'hotel-elixir-hills', hotel_name: 'Elixir Hills Suites Resort, Munnar', user_id: 'u33', user_name: 'Ritu Sen', user_photo: 'https://i.pravatar.cc/60?img=49', rating: 5, comment: 'The largest suites in Munnar! Excellent property nestled right inside a dense forest valley. Infinity pool view is stunning. Staff are incredibly helpful. Top class.', status: 'approved' },
  { review_id: 'rev-nks-001', hotel_id: 'hotel-niraamaya-kovalam', hotel_name: 'Niraamaya Retreats Surya Samudra, Kovalam', user_id: 'u34', user_name: 'Sarah Connor', user_photo: 'https://i.pravatar.cc/60?img=28', rating: 5, comment: 'The rock-cut infinity pool hanging over the ocean cliff is magical. Traditional tharavad cottages are beautifully maintained with premium luxury amenities. Ayurveda spa is world-class.', status: 'approved' }
];

async function main() {
  console.log('🏨 Inserting 5 additional top searching hotels...');
  const { error: hErr } = await supabase.from('hotels').upsert(hotels, { onConflict: 'id' });
  if (hErr) { console.error('❌ Hotels error:', hErr.message); process.exit(1); }
  console.log('✅ Hotels inserted successfully.');

  console.log('🛏️  Inserting rooms...');
  const { error: rErr } = await supabase.from('rooms').upsert(rooms, { onConflict: 'id' });
  if (rErr) { console.error('❌ Rooms error:', rErr.message); process.exit(1); }
  console.log('✅ Rooms inserted successfully.');

  console.log('⭐ Inserting reviews...');
  const { error: revErr } = await supabase.from('reviews').upsert(reviews, { onConflict: 'review_id' });
  if (revErr) { console.error('❌ Reviews error:', revErr.message); process.exit(1); }
  console.log('✅ Reviews inserted successfully.');

  console.log('\n🎉 Successfully inserted the 5 additional searching hotels, rooms, and reviews into Supabase!');
}

main().catch(console.error);
