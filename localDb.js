import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(process.cwd(), 'db.json');

const defaultDb = {
  hotels: [],
  rooms: [],
  coupons: [],
  users: [],
  bookings: [],
  reviews: [],
  system_users: [],
  audit_logs: [],
  favorites: [],
  config: []
};

function getSeedData() {
  const seed = { ...defaultDb };
  
  // Seed Hotels
  const hotelsSeed = [
    {
      id: 'hotel-001',
      name: 'Kumarakom Lake Resort',
      location: 'Kumarakom, Kottayam, Kerala',
      district: 'Kottayam',
      category: 'Luxury Resorts',
      rating: 4.9,
      reviews_count: 1284,
      price: 18500,
      tax: 3330,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'],
      map_url: 'https://maps.google.com/?q=Kumarakom+Lake+Resort',
      whatsapp: '919876543210',
      distance: '150 km from Kochi',
      badge: 'Top Rated',
      description: 'A breathtaking luxury resort on the banks of Vembanad Lake.',
      amenities: ["Swimming Pool","Spa & Wellness","Backwater Cruise","Restaurant","Bar","Yoga Center","Ayurveda","Free WiFi","AC Rooms","Room Service"],
      highlights: ["Heritage villas on water","Private pool villas available","Sunset boat cruises","Award-winning Ayurveda spa"],
      details: {"checkIn":"2:00 PM","checkOut":"12:00 PM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"},
      nearby: ["Vembanad Lake","Kumarakom Bird Sanctuary","Bay Island Driftwood Museum"],
      featured: true,
      trending: true,
      status: 'active'
    },
    {
      id: 'hotel-002',
      name: 'Taj Malabar Resort & Spa',
      location: 'Wellington Island, Kochi, Kerala',
      district: 'Ernakulam',
      category: 'Luxury Resorts',
      rating: 4.8,
      reviews_count: 2156,
      price: 14200,
      tax: 2556,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      images: [],
      map_url: 'https://maps.google.com/?q=Taj+Malabar+Kochi',
      whatsapp: '919876543211',
      distance: '5 km from Kochi Airport',
      badge: 'Luxury',
      description: 'Positioned on Wellington Island overlooking the Arabian Sea.',
      amenities: ["Sea View Rooms","Infinity Pool","Spa","Multiple Restaurants","Bar","Fitness Center","Tennis Court","Free WiFi","Concierge","Airport Transfer"],
      highlights: ["Harbour view rooms","Heritage building","Fine dining restaurants","Marina adjacent"],
      details: {"checkIn":"3:00 PM","checkOut":"12:00 PM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"},
      nearby: ["Fort Kochi","Chinese Fishing Nets","Mattancherry Palace","Jew Town"],
      featured: true,
      trending: false,
      status: 'active'
    },
    {
      id: 'hotel-003',
      name: 'Spice Village Thekkady',
      location: 'Thekkady, Idukki, Kerala',
      district: 'Idukki',
      category: 'Homestays',
      rating: 4.7,
      reviews_count: 876,
      price: 8900,
      tax: 1068,
      image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
      images: [],
      map_url: 'https://maps.google.com/?q=Spice+Village+Thekkady',
      whatsapp: '919876543212',
      distance: '4 km from Periyar Wildlife Sanctuary',
      badge: 'Eco Stay',
      description: 'Award-winning eco-resort featuring traditional Kerala cottages amid spice plantations.',
      amenities: ["Spice Plantation Walk","Ayurveda Treatments","Campfire","Restaurant","Yoga","Wildlife Safaris","Cultural Shows","Free WiFi"],
      highlights: ["Spice plantation walks","Periyar Tiger Reserve nearby","Authentic Kerala cuisine","Eco-certified property"],
      details: {"checkIn":"1:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 72 hours before check-in"},
      nearby: ["Periyar Tiger Reserve","Kumily Spice Market","Mangaladevi Temple"],
      featured: true,
      trending: true,
      status: 'active'
    },
    {
      id: 'hotel-004',
      name: 'Houseboat Delight Alleppey',
      location: 'Punnamada Lake, Alappuzha, Kerala',
      district: 'Alappuzha',
      category: 'Houseboats',
      rating: 4.6,
      reviews_count: 543,
      price: 7500,
      tax: 900,
      image: 'https://images.unsplash.com/photo-1593692909825-44b7b37a4d76?auto=format&fit=crop&w=800&q=80',
      images: [],
      map_url: 'https://maps.google.com/?q=Alleppey+Houseboat',
      whatsapp: '919876543213',
      distance: '3 km from Alappuzha Town',
      badge: 'Backwaters',
      description: 'A luxury AC houseboat cruising the serene backwaters of Alleppey.',
      amenities: ["AC Bedrooms","Sun Deck","Private Crew","Full Board Meals","Village Tour","Canoe Ride","Fishing","Sunset Cruise"],
      highlights: ["2-bedroom luxury houseboat","Cruising the Vembanad Lake","All meals included","Village and paddy field views"],
      details: {"checkIn":"12:00 PM","checkOut":"9:00 AM","breakfast":"Included (Full Board)","cancellation":"Free cancellation 48 hours before check-in"},
      nearby: ["Alappuzha Beach","Krishnapuram Palace","Marari Beach"],
      featured: true,
      trending: true,
      status: 'active'
    },
    {
      id: 'hotel-005',
      name: 'Munnar Retreat',
      location: 'Devikulam, Munnar, Kerala',
      district: 'Idukki',
      category: 'Hill Station Hotels',
      rating: 4.5,
      reviews_count: 712,
      price: 5800,
      tax: 696,
      image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80',
      images: [],
      map_url: 'https://maps.google.com/?q=Munnar+Tea+Garden',
      whatsapp: '919876543214',
      distance: '8 km from Munnar Town',
      badge: 'Scenic View',
      description: 'Perched at 5,000 feet above sea level with panoramic tea plantation views.',
      amenities: ["Tea Plantation View","Fireplace","Restaurant","Tea Factory Visit","Trekking","Bird Watching","Free WiFi","Bonfire"],
      highlights: ["360 degree tea garden views","Tea factory guided tour","Cool climate year-round","Trekking trails nearby"],
      details: {"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Included","cancellation":"Free cancellation 48 hours before check-in"},
      nearby: ["Eravikulam National Park","Mattupetty Dam","Anamudi Peak","Photo Point"],
      featured: false,
      trending: true,
      status: 'active'
    },
    {
      id: 'hotel-006',
      name: 'Varkala Cliff Beach Resort',
      location: 'North Cliff, Varkala, Kerala',
      district: 'Thiruvananthapuram',
      category: 'Beach Resorts',
      rating: 4.4,
      reviews_count: 634,
      price: 4200,
      tax: 504,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      images: [],
      map_url: 'https://maps.google.com/?q=Varkala+Cliff',
      whatsapp: '919876543215',
      distance: '51 km from Thiruvananthapuram',
      badge: 'Beachfront',
      description: 'Dramatic clifftop location with stunning views of the Arabian Sea.',
      amenities: ["Cliffside Restaurant","Beach Access","Yoga Classes","Surfing Lessons","Infinity Pool","Spa","Free WiFi","Bonfire"],
      highlights: ["Cliff-edge sea views","Natural mineral spring on beach","Surfer-friendly beach","Authentic local restaurants nearby"],
      details: {"checkIn":"2:00 PM","checkOut":"11:00 AM","breakfast":"Available","cancellation":"Free cancellation 24 hours before check-in"},
      nearby: ["Varkala Beach","Janardhana Swami Temple","Black Beach","Sivagiri Mutt"],
      featured: false,
      trending: false,
      status: 'active'
    }
  ];

  seed.hotels = hotelsSeed;

  // Auto-generate Rooms for each hotel
  hotelsSeed.forEach(h => {
    seed.rooms.push(
      {
        id: `${h.id}-std`,
        hotel_id: h.id,
        hotel_name: h.name,
        room_number: '101',
        type: 'Standard Room',
        capacity: 2,
        price: h.price,
        beds: 1,
        availability: 'available',
        amenities: ['AC', 'Free WiFi', 'TV', 'En-suite Bathroom'],
        inventory: 5
      },
      {
        id: `${h.id}-dlx`,
        hotel_id: h.id,
        hotel_name: h.name,
        room_number: '202',
        type: 'Deluxe Room',
        capacity: 3,
        price: Math.round(h.price * 1.3),
        beds: 2,
        availability: 'available',
        amenities: ['AC', 'Free WiFi', 'TV', 'Mini Fridge', 'Balcony'],
        inventory: 3
      },
      {
        id: `${h.id}-ste`,
        hotel_id: h.id,
        hotel_name: h.name,
        room_number: '303',
        type: 'Executive Suite',
        capacity: 4,
        price: Math.round(h.price * 1.8),
        beds: 2,
        availability: 'available',
        amenities: ['AC', 'Free WiFi', 'Smart TV', 'Mini Bar', 'Bathtub', 'Living Area'],
        inventory: 2
      }
    );
  });

  // Seed Coupons
  seed.coupons = [
    { code: 'KERALA10', discount_percent: 10, expiry_date: '2026-12-31', usage_limit: 500, min_booking_amount: 3000, status: 'active' },
    { code: 'SUMMER20', discount_percent: 20, expiry_date: '2026-09-30', usage_limit: 100, min_booking_amount: 5000, status: 'active' },
    { code: 'WELCOME15', discount_percent: 15, expiry_date: '2026-12-31', usage_limit: 200, min_booking_amount: 2000, status: 'active' }
  ];

  // Seed Config
  seed.config = [
    { key: 'settings', value: { platformName: 'HotelsNearMeInKerala.com', taxRate: 18, logoUrl: '/logo.webp', whatsappNumber: '919876543210' } },
    { key: 'seo', value: { heroTitle: 'Find The Perfect Stay Anywhere in Kerala', heroSubtext: 'Search and book the best hotels, resorts, homestays, and houseboats across God\'s Own Country.' } }
  ];

  return seed;
}

function loadDb() {
  if (!fs.existsSync(dbPath)) {
    const data = getSeedData();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return data;
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return getSeedData();
  }
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export const localDbPool = {
  async connect() {
    return {
      async query(sql, params) {
        return localDbPool.query(sql, params);
      },
      release() {}
    };
  },
  async query(sql, params) {
    const data = loadDb();
    const cleanSql = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. CONFIG
    if (cleanSql.includes('select value from config where key = $1')) {
      const item = data.config.find(c => c.key === params[0]);
      return { rows: item ? [item] : [] };
    }
    if (cleanSql.includes('insert into config')) {
      const key = params[0];
      const val = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
      const idx = data.config.findIndex(c => c.key === key);
      if (idx > -1) {
        data.config[idx].value = val;
      } else {
        data.config.push({ key, value: val });
      }
      saveDb(data);
      return { rows: [] };
    }

    // 2. HOTELS
    if (cleanSql.includes('select * from hotels')) {
      return { rows: data.hotels };
    }
    if (cleanSql.includes('insert into hotels')) {
      const h = {
        id: params[0], name: params[1], location: params[2], district: params[3], category: params[4],
        rating: params[5] || 4.5, reviews_count: params[6] || 0, price: params[7], tax: params[8], image: params[9],
        images: typeof params[10] === 'string' ? JSON.parse(params[10]) : params[10],
        map_url: params[11], whatsapp: params[12], distance: params[13], badge: params[14], description: params[15],
        amenities: typeof params[16] === 'string' ? JSON.parse(params[16]) : params[16],
        highlights: typeof params[17] === 'string' ? JSON.parse(params[17]) : params[17],
        details: typeof params[18] === 'string' ? JSON.parse(params[18]) : params[18],
        nearby: typeof params[19] === 'string' ? JSON.parse(params[19]) : params[19],
        featured: params[20] || false, trending: params[21] || false, status: params[22] || 'active',
        created_at: new Date().toISOString()
      };
      data.hotels.push(h);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update hotels set')) {
      const hotelId = params[params.length - 1];
      const hotel = data.hotels.find(h => h.id === hotelId);
      if (hotel) {
        const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
        const assignments = setPart.split(',').map(s => s.trim().split('=')[0].trim());
        assignments.forEach((col, idx) => {
          let val = params[idx];
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try { val = JSON.parse(val); } catch (e) {}
          }
          hotel[col] = val;
        });
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from hotels where id = $1')) {
      data.hotels = data.hotels.filter(h => h.id !== params[0]);
      saveDb(data);
      return { rows: [] };
    }

    // 3. ROOMS
    if (cleanSql.includes('select * from rooms')) {
      return { rows: data.rooms };
    }
    if (cleanSql.includes('insert into rooms')) {
      const r = {
        id: params[0], hotel_id: params[1], hotel_name: params[2], room_number: params[3], type: params[4],
        capacity: params[5], price: params[6], beds: params[7], availability: params[8] || 'available',
        amenities: typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9],
        inventory: params[10]
      };
      data.rooms.push(r);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update rooms set')) {
      const roomId = params[params.length - 1];
      const room = data.rooms.find(r => r.id === roomId);
      if (room) {
        const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
        const assignments = setPart.split(',').map(s => s.trim().split('=')[0].trim());
        assignments.forEach((col, idx) => {
          let val = params[idx];
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try { val = JSON.parse(val); } catch (e) {}
          }
          room[col] = val;
        });
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from rooms where id = $1')) {
      data.rooms = data.rooms.filter(r => r.id !== params[0]);
      saveDb(data);
      return { rows: [] };
    }

    // 4. COUPONS
    if (cleanSql.includes('select * from coupons')) {
      return { rows: data.coupons };
    }
    if (cleanSql.includes('insert into coupons')) {
      const c = {
        code: params[0], discount_percent: params[1], expiry_date: params[2],
        usage_limit: params[3] || 100, usage_count: params[4] || 0,
        min_booking_amount: params[5] || 0, status: params[6] || 'active'
      };
      data.coupons.push(c);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update coupons set')) {
      const code = params[params.length - 1];
      const coupon = data.coupons.find(c => c.code === code);
      if (coupon) {
        const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
        const assignments = setPart.split(',').map(s => s.trim().split('=')[0].trim());
        assignments.forEach((col, idx) => {
          coupon[col] = params[idx];
        });
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from coupons where code = $1')) {
      data.coupons = data.coupons.filter(c => c.code !== params[0]);
      saveDb(data);
      return { rows: [] };
    }

    // 5. USERS
    if (cleanSql.includes('select * from users')) {
      if (cleanSql.includes('where email = $1')) {
        const user = data.users.find(u => u.email === params[0]);
        return { rows: user ? [user] : [] };
      }
      if (cleanSql.includes('where uid = $1')) {
        const user = data.users.find(u => u.uid === params[0]);
        return { rows: user ? [user] : [] };
      }
      return { rows: data.users };
    }
    if (cleanSql.includes('insert into users')) {
      const u = {
        uid: params[0], name: params[1], email: params[2], role: params[3] || 'user',
        password: params[4], created_at: params[5], photo_url: params[6] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
      };
      const idx = data.users.findIndex(item => item.uid === u.uid);
      if (idx > -1) {
        data.users[idx] = { ...data.users[idx], name: u.name, photo_url: u.photo_url };
      } else {
        data.users.push(u);
      }
      saveDb(data);
      return { rows: [u] };
    }

    // 6. BOOKINGS
    if (cleanSql.includes('select * from bookings')) {
      return { rows: data.bookings };
    }
    if (cleanSql.includes('insert into bookings')) {
      const b = {
        booking_id: params[0], hotel_id: params[1], hotel_name: params[2], user_id: params[3],
        user_name: params[4], user_email: params[5], user_phone: params[6], room_type: params[7],
        check_in: params[8], check_out: params[9], guests: params[10], rooms_count: params[11],
        total_price: params[12], status: params[13] || 'pending', created_at: new Date().toISOString()
      };
      data.bookings.push(b);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update bookings set')) {
      const bookingId = params[params.length - 1];
      const booking = data.bookings.find(b => b.booking_id === bookingId);
      if (booking) {
        const setPart = sql.substring(sql.toLowerCase().indexOf('set') + 3, sql.toLowerCase().indexOf('where')).trim();
        const assignments = setPart.split(',').map(s => s.trim().split('=')[0].trim());
        assignments.forEach((col, idx) => {
          booking[col] = params[idx];
        });
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from bookings where booking_id = $1')) {
      data.bookings = data.bookings.filter(b => b.booking_id !== params[0]);
      saveDb(data);
      return { rows: [] };
    }

    // 7. REVIEWS
    if (cleanSql.includes('select rating from reviews where hotel_id = $1 and status = \'approved\'')) {
      const reviews = data.reviews.filter(r => r.hotel_id === params[0] && r.status === 'approved');
      return { rows: reviews };
    }
    if (cleanSql.includes('select * from reviews')) {
      return { rows: data.reviews };
    }
    if (cleanSql.includes('insert into reviews')) {
      const r = {
        review_id: params[0], hotel_id: params[1], hotel_name: params[2], user_id: params[3],
        user_name: params[4], user_photo: params[5], rating: params[6], comment: params[7],
        reply_text: params[8] || '', status: params[9] || 'pending', created_at: new Date().toISOString()
      };
      data.reviews.push(r);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update reviews set status = $1 where review_id = $2')) {
      const review = data.reviews.find(r => r.review_id === params[1]);
      if (review) {
        review.status = params[0];
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('select hotel_id from reviews where review_id = $1')) {
      const review = data.reviews.find(r => r.review_id === params[0]);
      return { rows: review ? [{ hotel_id: review.hotel_id }] : [] };
    }
    if (cleanSql.includes('update reviews set reply_text = $1 where review_id = $2')) {
      const review = data.reviews.find(r => r.review_id === params[1]);
      if (review) {
        review.reply_text = params[0];
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from reviews where review_id = $1')) {
      data.reviews = data.reviews.filter(r => r.review_id !== params[0]);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('update hotels set rating = $1, reviews_count = $2 where id = $3')) {
      const hotel = data.hotels.find(h => h.id === params[2]);
      if (hotel) {
        hotel.rating = params[0];
        hotel.reviews_count = params[1];
        saveDb(data);
      }
      return { rows: [] };
    }

    // 8. SYSTEM USERS
    if (cleanSql.includes('select * from system_users')) {
      return { rows: data.system_users };
    }
    if (cleanSql.includes('insert into system_users')) {
      const u = {
        id: params[0], email: params[1], name: params[2], role: params[3],
        permissions: params[4], status: params[5] || 'Active'
      };
      data.system_users.push(u);
      saveDb(data);
      return { rows: [] };
    }
    if (cleanSql.includes('delete from system_users where id = $1')) {
      data.system_users = data.system_users.filter(u => u.id !== params[0]);
      saveDb(data);
      return { rows: [] };
    }

    // 9. AUDIT LOGS
    if (cleanSql.includes('select * from audit_logs')) {
      return { rows: data.audit_logs };
    }
    if (cleanSql.includes('insert into audit_logs')) {
      const l = {
        log_id: params[0], operator_id: params[1], operator_email: params[2],
        action: params[3], target_type: params[4], target_id: params[5],
        previous_value: params[6], new_value: params[7], timestamp: new Date().toISOString()
      };
      data.audit_logs.push(l);
      saveDb(data);
      return { rows: [] };
    }

    // 10. FAVORITES
    if (cleanSql.includes('select * from favorites where user_id = $1')) {
      const favs = data.favorites.filter(f => f.user_id === params[0]);
      return { rows: favs };
    }
    if (cleanSql.includes('insert into favorites')) {
      const id = params[0];
      if (!data.favorites.some(f => f.id === id)) {
        data.favorites.push({
          id, user_id: params[1], hotel_id: params[2], created_at: new Date().toISOString()
        });
        saveDb(data);
      }
      return { rows: [] };
    }
    if (cleanSql.includes('delete from favorites where user_id = $1 and hotel_id = $2')) {
      data.favorites = data.favorites.filter(f => !(f.user_id === params[0] && f.hotel_id === params[1]));
      saveDb(data);
      return { rows: [] };
    }

    return { rows: [] };
  }
};
