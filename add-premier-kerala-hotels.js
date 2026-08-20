import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file
const SUPABASE_URL = 'https://evtdifjlmutqmoowiggj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

console.log('Connecting to Supabase:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const hotels = [
  {
    id: 'hotel-the-leela-kovalam',
    name: 'The Leela Kovalam, A Raviz Hotel',
    location: 'Kovalam Beach Road, Thiruvananthapuram',
    district: 'Thiruvananthapuram',
    category: 'Luxury Resorts',
    rating: 4.9,
    reviews_count: 1920,
    price: 16500,
    tax: 18,
    image: '/assets/hotels/hotel-the-leela-kovalam/main.webp',
    images: [
      '/assets/hotels/hotel-the-leela-kovalam/room1.webp',
      '/assets/hotels/hotel-the-leela-kovalam/room2.webp'
    ],
    map_url: 'https://maps.google.com/maps?q=The+Leela+Kovalam+A+Raviz+Hotel+Kerala&output=embed',
    whatsapp: '914713051234',
    distance: '12 km from Trivandrum International Airport',
    badge: '★ 5-Star Luxury',
    description: "Perched majestically on a cliff-top between two wide beaches, The Leela Kovalam offers panoramic views of the famous Kovalam coastline. This 5-star sanctuary features 188 rooms and suites, the world-class Divya Ayurveda spa, cliff-top infinity pools, private beach access, and authentic seafood fine dining overlooking the Arabian Sea.",
    amenities: ['Cliff-top Infinity Pool','Private Beach Access','Divya Ayurveda Spa','Seafood Specialty Restaurant','Sky Bar & Lounge','Ocean View Suites','Tennis Court','Butler Service','Free WiFi','Valet Parking','Fitness Center','Helipad'],
    highlights: ['Panoramic Arabian Sea cliff views','Private secluded beach access','Dedicated butler service in Club suites','Award-winning traditional Ayurveda therapy'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Buffet Included', 
      cancellation: '48 hours free cancellation', 
      phone: '+91 471 305 1234', 
      email: 'reservations.kovalam@theleela.com',
      imageAlt: 'The Leela Kovalam luxury cliff resort overlooking Arabian Sea beach',
      roomAlts: [
        'The Leela Kovalam royal ocean view suite layout',
        'The Leela Kovalam private balcony and infinity pool deck'
      ]
    },
    nearby: ['Kovalam Lighthouse Beach (800 m)','Hawa Beach (500 m)','Padmanabhaswamy Temple (14 km)','Varkala Cliffs (48 km)'],
    featured: true,
    trending: true,
    status: 'active',
    mainImgUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    roomImg1: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    roomImg2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hotel-taj-bekal-resort',
    name: 'Taj Bekal Resort & Spa, Kerala',
    location: 'Kappil Beach, Bekal, Kasaragod',
    district: 'Kasaragod',
    category: 'Luxury Resorts',
    rating: 4.9,
    reviews_count: 1450,
    price: 19000,
    tax: 18,
    image: '/assets/hotels/hotel-taj-bekal-resort/main.webp',
    images: [
      '/assets/hotels/hotel-taj-bekal-resort/room1.webp',
      '/assets/hotels/hotel-taj-bekal-resort/room2.webp'
    ],
    map_url: 'https://maps.google.com/maps?q=Taj+Bekal+Resort+and+Spa+Kasaragod+Kerala&output=embed',
    whatsapp: '914676644000',
    distance: '6 km from Bekal Fort',
    badge: 'Plunge Pool Villas',
    description: "Spread over 26 manicured acres along the Kappil River and Arabian Sea, Taj Bekal Resort & Spa draws architectural inspiration from traditional Kettuvallam houseboats. Featuring private plunge pool villas, Jiva Spa wellness retreats, river kayaking, and romantic beachfront dining under the stars.",
    amenities: ['Private Plunge Pools','Jiva Ayurvedic Spa','Kappil River Kayaking','Beachfront Dining','Infinity Swimming Pool','Cycling Trails','Boutique Fitness Center','Free WiFi','Air Conditioning','24/7 Room Service'],
    highlights: ['Houseboat-inspired villa architecture with private courtyard pools','Award-winning Jiva Ayurvedic wellness treatments','Direct pristine beach access and river kayaking','Stunning location minutes from historic Bekal Fort'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '12:00 PM', 
      breakfast: 'Included', 
      cancellation: '72 hours free cancellation', 
      phone: '+91 467 664 4000', 
      email: 'bekal.kerala@tajhotels.com',
      imageAlt: 'Taj Bekal Resort and Spa luxury villas in Kasaragod North Kerala',
      roomAlts: [
        'Taj Bekal private plunge pool villa suite bedroom',
        'Taj Bekal open-air courtyard and lagoon view lounge'
      ]
    },
    nearby: ['Bekal Fort (6 km)','Kappil Beach (200 m)','Chandragiri Fort (18 km)','Valiyaparamba Backwaters (28 km)'],
    featured: true,
    trending: true,
    status: 'active',
    mainImgUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    roomImg1: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    roomImg2: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hotel-vythiri-resort-wayanad',
    name: 'Vythiri Resort Wayanad',
    location: 'Lakkidi, Vythiri, Wayanad',
    district: 'Wayanad',
    category: 'Hill Station Hotels',
    rating: 4.8,
    reviews_count: 2150,
    price: 11500,
    tax: 12,
    image: '/assets/hotels/hotel-vythiri-resort-wayanad/main.webp',
    images: [
      '/assets/hotels/hotel-vythiri-resort-wayanad/room1.webp',
      '/assets/hotels/hotel-vythiri-resort-wayanad/room2.webp'
    ],
    map_url: 'https://maps.google.com/maps?q=Vythiri+Resort+Lakkidi+Wayanad+Kerala&output=embed',
    whatsapp: '914936256800',
    distance: '3.5 km from Lakkidi Viewpoint',
    badge: 'Rainforest Canopy',
    description: "Set deep inside a lush 150-acre tropical rainforest in Wayanad, Vythiri Resort is an iconic eco-sanctuary. Walk across the rope suspension bridge over mountain streams, stay in luxury treehouses perched 80 feet above the forest canopy, or relax in private pool villas amidst mist and chirping birds.",
    amenities: ['Canopy Treehouses','Hanging Rope Bridge','Forest Stream Swimming Pool','Ayurvedic Rejuvenation Spa','Naturalist Guided Treks','Multi-Cuisine Restaurant','Games Room','Free WiFi','Conference Hall','Eco Friendly Design'],
    highlights: ['Iconic treehouse suites 80 feet high in the canopy','Natural mountain stream and rope suspension bridge','Deep rainforest immersion with rich flora and birdlife','Cool misty climate year-round at 3,000 feet elevation'],
    details: { 
      checkIn: '1:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included (Full Board Options)', 
      cancellation: '48 hours free cancellation', 
      phone: '+91 4936 256 800', 
      email: 'vythiri@vythiriresort.com',
      imageAlt: 'Vythiri Resort Wayanad rainforest treehouses and stream bridge',
      roomAlts: [
        'Vythiri Resort luxury treehouse interior overlooking rainforest canopy',
        'Vythiri Resort private pool villa surrounded by bamboo groves'
      ]
    },
    nearby: ['Lakkidi View Point (3.5 km)','Pookode Lake (5 km)','Chain Tree (4 km)','Chembra Peak (22 km)'],
    featured: true,
    trending: true,
    status: 'active',
    mainImgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    roomImg1: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
    roomImg2: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hotel-marari-beach-resort',
    name: 'Marari Beach Resort CGH Earth',
    location: 'Mararikulam North, Alappuzha',
    district: 'Alappuzha',
    category: 'Beach Resorts',
    rating: 4.8,
    reviews_count: 1680,
    price: 14800,
    tax: 18,
    image: '/assets/hotels/hotel-marari-beach-resort/main.webp',
    images: [
      '/assets/hotels/hotel-marari-beach-resort/room1.webp',
      '/assets/hotels/hotel-marari-beach-resort/room2.webp'
    ],
    map_url: 'https://maps.google.com/maps?q=Marari+Beach+Resort+CGH+Earth+Alappuzha+Kerala&output=embed',
    whatsapp: '914782863801',
    distance: '14 km from Alappuzha Town',
    badge: 'Eco Beachfront',
    description: "Marari Beach Resort CGH Earth is an eco-luxury haven situated on a 30-acre coconut grove bordering Marari Beach. Featuring authentic thatched-roof villas inspired by traditional fishing villages, a massive butterfly garden, organic farm-to-table dining, and direct access to pristine golden sands.",
    amenities: ['Secluded Beachfront','Private Pool Cottages','Butterfly Garden','Organic Farm-to-Table Restaurant','Ayurvedic Centre','Tennis & Badminton Courts','Yoga & Meditation','Free WiFi','Air Conditioning','Bicycle Tours'],
    highlights: ['30 acres of coconut groves opening directly onto golden Marari sands','Charming thatch-roof cottages with private garden courtyards','Butterfly garden home to over 80 species of native butterflies','Sustainable farm-to-table cuisine prepared with fresh catch and organic produce'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '72 hours free cancellation', 
      phone: '+91 478 286 3801', 
      email: 'mararibeach@cghearth.com',
      imageAlt: 'Marari Beach Resort CGH Earth thatched villas on Alappuzha coast',
      roomAlts: [
        'Marari Beach garden villa bedroom with open-to-sky shower',
        'Marari Beach pool cottage private swimming pool and lounge deck'
      ]
    },
    nearby: ['Marari Beach (Direct Access)','Alappuzha Backwaters (15 km)','Arthunkal Church (6 km)','Pathiramanal Island (16 km)'],
    featured: true,
    trending: true,
    status: 'active',
    mainImgUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    roomImg1: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    roomImg2: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hotel-spice-village-thekkady',
    name: 'Spice Village CGH Earth, Thekkady',
    location: 'Kumily Road, Thekkady, Idukki',
    district: 'Idukki',
    category: 'Eco Lodges',
    rating: 4.8,
    reviews_count: 1320,
    price: 10200,
    tax: 12,
    image: '/assets/hotels/hotel-spice-village-thekkady/main.webp',
    images: [
      '/assets/hotels/hotel-spice-village-thekkady/room1.webp',
      '/assets/hotels/hotel-spice-village-thekkady/room2.webp'
    ],
    map_url: 'https://maps.google.com/maps?q=Spice+Village+CGH+Earth+Thekkady+Kerala&output=embed',
    whatsapp: '914869224514',
    distance: '1 km from Periyar Tiger Reserve',
    badge: 'Tribal Eco Sanctuary',
    description: "Recreated as a traditional tribal village of the Mannan community, Spice Village is nestled in the cool spice-scented hills just outside Periyar Tiger Reserve. Thatch-roofed cottages with elephant grass roofs, 50 species of birds, native spices, botanical paper-making, and guided jungle treks.",
    amenities: ['Elephant Grass Thatch Cottages','Spice Plantation Walks','Periyar Jungle Treks','Ayurveda Vaidyasala','Swimming Pool','Botanical Paper Making Workshop','Organic Tea Shop','Free WiFi','Air Conditioning','Nature Library'],
    highlights: ['Eco-living village modeled after native Mannan tribe dwellings','1 km from Periyar National Park boat cruise & safari','Handmade paper-making unit and 100% chemical-free gardens','Cool cardamom-scented mountain air and jungle serenity'],
    details: { 
      checkIn: '2:00 PM', 
      checkOut: '11:00 AM', 
      breakfast: 'Included', 
      cancellation: '48 hours free cancellation', 
      phone: '+91 4869 224 514', 
      email: 'spicevillage@cghearth.com',
      imageAlt: 'Spice Village CGH Earth eco tribal cottages in Thekkady Idukki',
      roomAlts: [
        'Spice Village traditional elephant grass cottage bedroom interior',
        'Spice Village lush spice garden veranda and outdoor sitting area'
      ]
    },
    nearby: ['Periyar Tiger Reserve (1 km)','Periyar Lake Boating (1.5 km)','Elephant Junction Thekkady (3.5 km)','Kumily Spice Market (500 m)'],
    featured: true,
    trending: true,
    status: 'active',
    mainImgUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
    roomImg1: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    roomImg2: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function processHotelImages(hotel) {
  const hotelDir = path.join(__dirname, 'public', 'assets', 'hotels', hotel.id);
  if (!fs.existsSync(hotelDir)) {
    fs.mkdirSync(hotelDir, { recursive: true });
  }

  const tmpMain = path.join(hotelDir, 'temp_main.jpg');
  const tmpR1 = path.join(hotelDir, 'temp_r1.jpg');
  const tmpR2 = path.join(hotelDir, 'temp_r2.jpg');

  try {
    console.log(`Downloading images for: ${hotel.name}`);
    await downloadFile(hotel.mainImgUrl, tmpMain);
    await downloadFile(hotel.roomImg1, tmpR1);
    await downloadFile(hotel.roomImg2, tmpR2);

    // Convert to webp
    await sharp(tmpMain).resize(1200, 800, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(hotelDir, 'main.webp'));
    await sharp(tmpMain).resize(600, 400, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(hotelDir, 'thumb.webp'));
    await sharp(tmpR1).resize(800, 533, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(hotelDir, 'room1.webp'));
    await sharp(tmpR2).resize(800, 533, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(hotelDir, 'room2.webp'));

    // Clean temp
    if (fs.existsSync(tmpMain)) fs.unlinkSync(tmpMain);
    if (fs.existsSync(tmpR1)) fs.unlinkSync(tmpR1);
    if (fs.existsSync(tmpR2)) fs.unlinkSync(tmpR2);

    console.log(`✓ WebP images processed for: ${hotel.id}`);
  } catch (err) {
    console.error(`Error processing images for ${hotel.id}:`, err.message);
  }
}

async function run() {
  console.log(`Processing and inserting ${hotels.length} premier hotels...`);

  for (const hotel of hotels) {
    await processHotelImages(hotel);

    const record = {
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      district: hotel.district,
      category: hotel.category,
      rating: hotel.rating,
      reviews_count: hotel.reviews_count,
      price: hotel.price,
      tax: hotel.tax,
      image: hotel.image,
      images: hotel.images,
      map_url: hotel.map_url,
      whatsapp: hotel.whatsapp,
      distance: hotel.distance,
      badge: hotel.badge,
      description: hotel.description,
      amenities: hotel.amenities,
      highlights: hotel.highlights,
      details: hotel.details,
      nearby: hotel.nearby,
      featured: hotel.featured,
      trending: hotel.trending,
      status: hotel.status
    };

    const { error } = await supabase.from('hotels').upsert(record);
    if (error) {
      console.error(`Failed to upsert ${hotel.name}:`, error.message);
    } else {
      console.log(`✅ Successfully added hotel to database: ${hotel.name}`);
    }
  }

  console.log('All premier hotels successfully processed and synced with Supabase!');
}

run();
