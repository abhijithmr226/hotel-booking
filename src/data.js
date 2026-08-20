import { supabase } from "./supabase";
import STATIC_HOTELS from "../kerala_500_hotels.json";

// ─── Static UI data (not stored in database) ───────────────────────────────
export const DESTINATIONS = [
  { name: "Kochi", count: 320, image: "/assets/images/kochi.webp" },
  { name: "Munnar", count: 180, image: "/assets/images/munnar.webp" },
  { name: "Alappuzha", count: 240, image: "/assets/images/alappuzha.webp" },
  { name: "Varkala", count: 120, image: "/assets/images/varkala.webp" },
  { name: "Kovalam", count: 96, image: "/assets/images/kovalam.webp" },
  { name: "Wayanad", count: 130, image: "/assets/images/wayanad.webp" }
];

export const CATEGORIES = [
  { name: "Beach Resorts", icon: "fa-umbrella-beach", desc: "Sun, sand & the Arabian Sea" },
  { name: "Hill Station Hotels", icon: "fa-mountain", desc: "Cool misty mountain escapes" },
  { name: "Houseboats", icon: "fa-ship", desc: "Float through Kerala backwaters" },
  { name: "Homestays", icon: "fa-home", desc: "Live with local Kerala families" },
  { name: "Luxury Resorts", icon: "fa-gem", desc: "World-class comfort & service" },
  { name: "Budget Hotels", icon: "fa-wallet", desc: "Comfortable stays, great value" },
  { name: "Business Hotels", icon: "fa-briefcase", desc: "Work-ready, city-center stays" },
  { name: "Family Hotels", icon: "fa-users", desc: "Kid-friendly, spacious & fun" },
  { name: "Ayurveda Resorts", icon: "fa-spa", desc: "Ancient healing & wellness" },
  { name: "Eco Lodges", icon: "fa-leaf", desc: "Sustainable, nature-first stays" },
  { name: "Treehouse Stays", icon: "fa-tree", desc: "Sleep above the forest canopy" },
  { name: "Heritage Hotels", icon: "fa-landmark", desc: "Palaces, mansions & history" },
  { name: "Wildlife Resorts", icon: "fa-paw", desc: "Next to national parks & jungles" },
  { name: "Couple Retreats", icon: "fa-heart", desc: "Romantic getaways in Kerala" },
  { name: "Pilgrimage Stays", icon: "fa-pray", desc: "Near temples, churches & mosques" },
  { name: "Backpacker Hostels", icon: "fa-bed", desc: "Social, affordable, vibrant stays" }
];

const DEFAULT_SETTINGS = {
  platformName: "HotelsNearMeInKerala.com",
  taxRate: 18,
  logoUrl: "/logo.webp",
  notifyEmail: true,
  notifyWhatsapp: true,
  enableSound: true,
  currency: "INR",
  whatsappNumber: "919447908576",
  autoInvoice: true
};

const DEFAULT_SEO = {
  heroTitle: "Find The Perfect Stay Anywhere in Kerala",
  heroSubtext: "Search and book the best hotels, resorts, homestays, and houseboats across God's Own Country.",
  trustBadge: "Trusted by 25,000+ Happy Travelers"
};

// ─── In-memory store ───────────────────────────────────────────────
const store = {
  hotels: Array.isArray(STATIC_HOTELS) ? [...STATIC_HOTELS] : [],
  bookings: [],
  rooms: [],
  users: [],
  reviews: [],
  coupons: [],
  audit_logs: [],
  system_users: [],
  settings: { ...DEFAULT_SETTINGS },
  seo: { ...DEFAULT_SEO }
};

let dataReadyResolve;
const dataReady = new Promise((resolve) => { dataReadyResolve = resolve; });

const dataListeners = new Set();

function notifyChange(source) {
  dataListeners.forEach((cb) => {
    try { cb(source, store); } catch (e) { console.error(e); }
  });
}

function sortByDateDesc(list, field = "createdAt") {
  return [...list].sort((a, b) => (b[field] || "").localeCompare(a[field] || ""));
}

export function onDataChange(callback) {
  dataListeners.add(callback);
  return () => dataListeners.delete(callback);
}

// ─── SQL column mapping utilities ──────────────────────────────────────────
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


/**
 * Generate a URL-friendly slug from a hotel name.
 * Example: "The Raviz Ashtamudi Resort & Hotel" → "the-raviz-ashtamudi-resort-hotel"
 * Used for SEO-friendly URLs like /hotel.html?slug=the-raviz-ashtamudi-resort-hotel
 */
export function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars (& ' . etc)
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .substring(0, 80);               // max 80 chars
}

/**
 * Generates a unique, original editorial description for a hotel based on
 * its structured data — never copying from third-party sources.
 *
 * Assembles 3-5 sentences from curated sentence banks keyed to:
 * category, district setting, amenities, price tier, and rating.
 * Each combination produces a distinct result, so no two hotels share text.
 */
export function generateUniqueDescription(hotel) {
  try {
    const name = hotel?.name || 'This property';
    const dist = hotel?.district || 'Kerala';
    const cat = String(hotel?.category || '').toLowerCase();
    const amenities = Array.isArray(hotel?.amenities) ? hotel.amenities.map(a => String(a).toLowerCase()) : [];
    const price = Number(hotel?.price) || 3000;
    const rating = parseFloat(hotel?.rating) || 4.2;

    // ── Setting sentences by category ────────────────────────────────────
    const settingMap = {
      'luxury resorts': [
        `${name} is a handpicked luxury retreat set against the lush landscapes of ${dist}, Kerala`,
        `Nestled in the pristine heartland of ${dist}, ${name} is a marquee address among Kerala's finest luxury properties`,
        `Rising above ${dist}'s natural splendour, ${name} is a destination resort crafted for discerning travellers`,
      ],
      'beach resorts': [
        `${name} occupies a prime stretch of Kerala's sun-kissed coastline in ${dist}`,
        `With direct access to a secluded beach in ${dist}, ${name} offers an unfiltered connection with the Arabian Sea`,
        `Positioned along one of ${dist}'s most scenic shores, ${name} combines salt-air freshness with curated comfort`,
      ],
      'hill station hotels': [
        `Perched among the mist-draped peaks of ${dist}, ${name} is a sanctuary for those seeking cool mountain air and forest stillness`,
        `Set at altitude in the Western Ghats region of ${dist}, ${name} commands sweeping valley views from every vantage point`,
        `${name} sits quietly in the rolling tea and spice country of ${dist}, where mornings arrive with fog and birdsong`,
      ],
      'houseboats': [
        `${name} is a beautifully appointed traditional Kerala houseboat drifting through the legendary backwaters of ${dist}`,
        `Gliding silently across the palm-fringed waterways of ${dist}, ${name} offers an immersive stay on Kerala's iconic backwater network`,
        `Aboard ${name}, guests experience the rhythm of life along ${dist}'s ancient canal system at a pace only a houseboat can offer`,
      ],
      'homestays': [
        `${name} is an authentic Kerala homestay in ${dist} where guests are welcomed into a family home that has been passed down through generations`,
        `Tucked inside a traditional Naluketttu compound in ${dist}, ${name} brings visitors face-to-face with the real texture of Kerala village life`,
        `More than accommodation, ${name} is a living cultural experience — guests share meals, stories, and the unhurried rhythms of ${dist} family life`,
      ],
      'ayurveda resorts': [
        `${name} in ${dist} is a dedicated Ayurveda wellness retreat where ancient healing traditions are practised by certified Vaidyas in an immersive natural setting`,
        `Drawing on Kerala's 3,000-year Ayurveda heritage, ${name} in ${dist} offers medically supervised rejuvenation programmes within a tranquil residential campus`,
        `${name} is ${dist}'s premier Ayurveda destination, where personalised Panchakarma therapies are delivered in a serene, medically sound environment`,
      ],
      'eco lodges': [
        `${name} is an award-winning eco lodge in ${dist} built with locally sourced materials and designed to leave the surrounding forest entirely undisturbed`,
        `Hidden inside a protected forest buffer zone in ${dist}, ${name} operates on solar power and rainwater harvesting to minimise its ecological footprint`,
        `${name} demonstrates that responsible tourism and genuine comfort can coexist — its cabins in ${dist} are sensitively integrated into the natural terrain`,
      ],
      'treehouse stays': [
        `${name} offers a rare chance to sleep suspended among the forest canopy in ${dist}, with wooden platforms built around living trees`,
        `At ${name}, guests climb a bamboo ladder to their room above the ${dist} forest floor — a childhood fantasy translated into a surprisingly luxurious experience`,
        `Perched in the treetops of ${dist}'s rainforest, ${name}'s treehouse rooms sway gently and open to dawn chorus views that few properties in Kerala can match`,
      ],
      'heritage hotels': [
        `${name} is a lovingly restored heritage property in ${dist} that preserves the architectural grace of a bygone era while delivering modern comforts`,
        `Once a private estate, ${name} in ${dist} has been thoughtfully converted into a boutique heritage hotel where each room tells a different chapter of Kerala's history`,
        `The teak-beam ceilings, hand-carved doorways, and courtyard gardens of ${name} transport guests to ${dist}'s royal past without sacrificing any contemporary amenity`,
      ],
      'wildlife resorts': [
        `${name} sits on the edge of a protected wildlife corridor in ${dist}, giving guests front-row access to Kerala's most biodiverse jungles`,
        `With ${dist}'s forests as its backdrop, ${name} is a naturalist's base camp — offering guided safaris, nocturnal walks, and the remote possibility of sighting an elephant at the waterhole`,
        `${name} occupies a privileged position within ${dist}'s wildlife buffer zone, where the boundary between lodge and jungle is deliberately blurred`,
      ],
      'budget hotels': [
        `${name} is a well-maintained budget hotel in the heart of ${dist}, offering clean, comfortable rooms at prices that make exploring Kerala genuinely accessible`,
        `Practical without being plain, ${name} in ${dist} delivers reliable hospitality and central connectivity at one of the most honest price points in the district`,
        `${name} proves that a Kerala stay doesn't need to cost a fortune — its ${dist} location, attentive staff, and tidy rooms offer real value for independent travellers`,
      ],
      'business hotels': [
        `${name} is ${dist}'s go-to address for business travellers — purpose-built conference facilities, high-speed connectivity, and a central location combine without compromise`,
        `Designed for the corporate circuit, ${name} in ${dist} keeps professionals productive with ergonomic workspaces, express dining, and seamless airport transfers`,
        `${name} understands the working traveller's priorities: reliable Wi-Fi, quick check-in, a well-equipped gym, and a restaurant open before the first meeting — all available in ${dist}`,
      ],
      'family hotels': [
        `${name} in ${dist} is built around the needs of families — children's activity zones, connecting rooms, and a menu that goes well beyond grown-up tastes`,
        `From the shallow splash pool to the supervised kids' club, ${name} in ${dist} ensures that younger guests are as well catered for as their parents`,
        `${name} earns its family-friendly reputation in ${dist} through genuine thoughtfulness: cots on request, child-safe balconies, and local sightseeing packages that excite every age group`,
      ],
      'couple retreats': [
        `${name} is one of ${dist}'s most sought-after romantic retreats — its private pool villas, candlelit dining settings, and couples' spa ritual have made it a favourite for anniversaries and honeymoons`,
        `Designed for intimacy, ${name} in ${dist} offers secluded cottages, in-room dining at sunset, and Ayurvedic couple treatments under an open-air pavilion`,
        `Whether you're celebrating a honeymoon or simply escaping together, ${name} in ${dist} wraps every moment in the kind of quiet luxury that makes time feel slower`,
      ],
    };

    // ── Amenity highlight sentences ───────────────────────────────────────
    const amenityPhrases = [];
    if (amenities.some(a => a.includes('pool') || a.includes('infinity pool')))
      amenityPhrases.push('an infinity-edge pool that seems to pour into the surrounding landscape');
    if (amenities.some(a => a.includes('spa') || a.includes('ayurveda')))
      amenityPhrases.push('a full-service spa offering traditional Kerala Ayurveda and contemporary wellness therapies');
    if (amenities.some(a => a.includes('restaurant') || a.includes('dining')))
      amenityPhrases.push('an in-house restaurant serving Kerala\'s rich coastal cuisine alongside continental favourites');
    if (amenities.some(a => a.includes('wi-fi') || a.includes('wifi')))
      amenityPhrases.push('complimentary high-speed Wi-Fi throughout the property');
    if (amenities.some(a => a.includes('parking') || a.includes('free parking')))
      amenityPhrases.push('ample free parking for guests arriving by car');
    if (amenities.some(a => a.includes('gym') || a.includes('fitness')))
      amenityPhrases.push('a well-equipped fitness centre');
    if (amenities.some(a => a.includes('rooftop') || a.includes('terrace')))
      amenityPhrases.push('a rooftop terrace with panoramic district views');
    if (amenities.some(a => a.includes('beach') || a.includes('beachfront')))
      amenityPhrases.push('direct beachfront access via a private pathway');

    // ── Price-tier context sentence ───────────────────────────────────────
    let priceSentence = '';
    if (price < 2000) {
      priceSentence = `Starting at just ₹${price.toLocaleString('en-IN')} per night, ${name} is one of ${dist}'s most affordable options without compromising on cleanliness or location.`;
    } else if (price < 5000) {
      priceSentence = `With rates from ₹${price.toLocaleString('en-IN')} per night, ${name} sits squarely in ${dist}'s mid-range — delivering genuine value in a competitive market.`;
    } else if (price < 12000) {
      priceSentence = `Priced from ₹${price.toLocaleString('en-IN')} per night, ${name} positions itself at the premium end of ${dist}'s hospitality landscape, justifying every rupee with considered service and refined surroundings.`;
    } else {
      priceSentence = `As one of ${dist}'s top-tier properties with rates from ₹${price.toLocaleString('en-IN')} per night, ${name} sets the benchmark for Kerala luxury — an investment in an experience, not just a room.`;
    }

    // ── Rating-based trust sentence ───────────────────────────────────────
    let ratingLine = '';
    if (rating >= 4.8) ratingLine = `Consistently rated among Kerala's finest by returning guests, ${name} maintains an exceptional standard that speaks louder than any marketing copy.`;
    else if (rating >= 4.5) ratingLine = `With a strong guest rating and a growing base of loyal visitors, ${name} has established itself as one of ${dist}'s most dependable stays.`;
    else if (rating >= 4.0) ratingLine = `${name} is well-regarded by guests for its warm staff, reliable facilities, and the kind of unhurried hospitality that ${dist} is known for.`;
    else ratingLine = `${name} is a welcoming address in ${dist} for travellers who value comfort, simplicity, and the honest warmth of Kerala service.`;

    // ── Assemble the description ──────────────────────────────────────────
    const catKey = Object.keys(settingMap).find(k => cat.includes(k)) || 'luxury resorts';
    const pool = settingMap[catKey] || settingMap['luxury resorts'];
    const nameHash = String(name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const settingSentence = pool[nameHash % pool.length];

    let amenityLine = '';
    if (amenityPhrases.length >= 2) {
      amenityLine = `Guests enjoy ${amenityPhrases.slice(0, 2).join(', and ')}.`;
    } else if (amenityPhrases.length === 1) {
      amenityLine = `Facilities include ${amenityPhrases[0]}.`;
    }

    const parts = [settingSentence + '.', amenityLine, priceSentence, ratingLine].filter(Boolean);
    return parts.join(' ');
  } catch (err) {
    console.warn("generateUniqueDescription fallback for:", hotel?.name, err);
    return `${hotel?.name || 'This hotel'} is a certified accommodation located in ${hotel?.location || hotel?.district || 'Kerala'}, offering comfortable rooms, friendly local hospitality, and direct booking at best rates.`;
  }
}

function mapHotelRow(row) {
  if (!row) return null;
  const hotel = {
    id: row.id,
    slug: generateSlug(row.name) || String(row.id),
    name: row.name || 'Kerala Hotel',
    location: row.location || 'Kerala',
    district: row.district || 'Kerala',
    category: row.category || 'Hotel & Resort',
    rating: parseFloat(row.rating) || 4.5,
    reviewsCount: Number(row.reviews_count) || 0,
    price: Number(row.price) || 2500,
    tax: row.tax || null,
    image: row.image || '/assets/images/riverside.webp',
    images: Array.isArray(row.images) ? row.images : [],
    mapUrl: row.map_url || '',
    whatsapp: row.whatsapp || '',
    distance: row.distance || null,
    badge: row.badge || '',
    description: row.description || '',
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    details: row.details || {},
    nearby: Array.isArray(row.nearby) ? row.nearby : [],
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    status: row.status || 'active'
  };

  const descStr = typeof hotel.description === 'string' ? hotel.description.trim() : '';
  if (!descStr || descStr.length < 30) {
    hotel.description = generateUniqueDescription(hotel);
  }

  return hotel;
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
  let photos = [];
  try {
    if (Array.isArray(row.photos)) photos = row.photos;
    else if (typeof row.photos === 'string' && row.photos.startsWith('[')) photos = JSON.parse(row.photos);
  } catch (e) {}

  let subRatings = null;
  try {
    if (row.sub_ratings && typeof row.sub_ratings === 'object') subRatings = row.sub_ratings;
    else if (typeof row.sub_ratings === 'string' && row.sub_ratings.startsWith('{')) subRatings = JSON.parse(row.sub_ratings);
  } catch (e) {}

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
    photos: photos,
    subRatings: subRatings,
    tripType: row.trip_type || '',
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

// ─── Sync all data from Supabase directly ──────────────────────────────────────
async function refreshAllData() {
  try {
    await Promise.all([
      // Hotels
      (async () => {
        const { data, error } = await supabase.from('hotels').select('*').order('name', { ascending: true });
        if (!error && data) {
          store.hotels = data.map(mapHotelRow);
          notifyChange("hotels");
        }
      })(),
      // Bookings
      (async () => {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          store.bookings = sortByDateDesc(data.map(mapBookingRow));
          notifyChange("bookings");
        }
      })(),
      // Rooms
      (async () => {
        const { data, error } = await supabase.from('rooms').select('*');
        if (!error && data) {
          store.rooms = data.map(mapRoomRow);
          notifyChange("rooms");
        }
      })(),
      // Users
      (async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
          store.users = data.map(mapUserRow);
          notifyChange("users");
        }
      })(),
      // Reviews
      (async () => {
        const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          store.reviews = sortByDateDesc(data.map(mapReviewRow));
          notifyChange("reviews");
        }
      })(),
      // Coupons
      (async () => {
        const { data, error } = await supabase.from('coupons').select('*');
        if (!error && data) {
          store.coupons = data.map(mapCouponRow);
          notifyChange("coupons");
        }
      })(),
      // Audit Logs
      (async () => {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (!error && data) {
          store.audit_logs = sortByDateDesc(data.map(mapAuditLogRow), "timestamp");
          notifyChange("audit_logs");
        }
      })(),
      // System Users
      (async () => {
        const { data, error } = await supabase.from('system_users').select('*');
        if (!error && data) {
          store.system_users = data.map(mapSystemUserRow);
          notifyChange("system_users");
        }
      })(),
      // Settings Config
      (async () => {
        const { data, error } = await supabase.from('config').select('value').eq('key', 'settings').maybeSingle();
        if (!error && data) {
          store.settings = { ...DEFAULT_SETTINGS, ...data.value };
          notifyChange("settings");
        }
      })(),
      // SEO Config
      (async () => {
        const { data, error } = await supabase.from('config').select('value').eq('key', 'seo').maybeSingle();
        if (!error && data) {
          store.seo = { ...DEFAULT_SEO, ...data.value };
          notifyChange("seo");
        }
      })()
    ]);

    dataReadyResolve(store);
  } catch (err) {
    console.error("Failed to sync Supabase data:", err);
    dataReadyResolve(store);
  }
}

// ─── Realtime initialization ────────────────────────────────────────────────
export async function initRealtimeData() {
  await refreshAllData();
  
  // Set up polling interval to sync data every 6 seconds in the background
  setInterval(async () => {
    await refreshAllData();
  }, 6000);

  console.log("Connected to Supabase Client API.");
  return store;
}

/** @deprecated Use initRealtimeData */
export async function seedDatabase() {
  return initRealtimeData();
}

// ─── Read helpers (from live cache) ───────────────────────────────────────────
async function waitForData() {
  await dataReady;
  return store;
}

export async function getHotels() {
  await waitForData();
  return [...store.hotels];
}

/**
 * Look up a hotel by its slug (SEO-friendly name).
 * Falls back to id-based lookup for backwards compatibility with old ?id= links.
 */
export async function getHotelBySlug(slug) {
  await waitForData();
  if (!slug) return store.hotels[0] || null;
  const clean = String(slug).toLowerCase().trim();
  // 1. Exact slug match
  const bySlug = store.hotels.find(h => h.slug && h.slug.toLowerCase() === clean);
  if (bySlug) return bySlug;
  // 2. Match generated slug from name
  const byGen = store.hotels.find(h => generateSlug(h.name) === clean);
  if (byGen) return byGen;
  // 3. Fallback: match by id
  const byId = store.hotels.find(h => h.id && h.id.toLowerCase() === clean);
  if (byId) return byId;
  // 4. Loose match
  return store.hotels.find(h => (h.name && h.name.toLowerCase().includes(clean)) || (h.slug && h.slug.includes(clean))) || store.hotels[0] || null;
}

export async function getBookings() {
  await waitForData();
  return [...store.bookings];
}

export async function getRooms() {
  await waitForData();
  return [...store.rooms];
}

export async function getUsers() {
  await waitForData();
  return [...store.users];
}

export async function getReviews() {
  await waitForData();
  return [...store.reviews];
}

export async function getCoupons() {
  await waitForData();
  return [...store.coupons];
}

export async function getAuditLogs() {
  await waitForData();
  return [...store.audit_logs];
}

export async function getSystemUsers() {
  await waitForData();
  return [...store.system_users];
}

export async function getSettings() {
  await waitForData();
  return { ...store.settings };
}

export async function getSeo() {
  await waitForData();
  return { ...store.seo };
}

export async function getUserByUid(uid) {
  await waitForData();
  return store.users.find((u) => u.uid === uid) || null;
}

// ─── Config writes ────────────────────────────────────────────────────────────
export async function saveSettings(updates) {
  const { error } = await supabase.from('config').upsert({ key: 'settings', value: updates });
  if (error) throw error;
  await refreshAllData();
}

export async function saveSeo(updates) {
  const { error } = await supabase.from('config').upsert({ key: 'seo', value: updates });
  if (error) throw error;
  await refreshAllData();
}

export async function saveGatewaySettings({ currency, whatsappNumber, autoInvoice }) {
  const updates = { ...store.settings, currency, whatsappNumber, autoInvoice };
  await saveSettings(updates);
}

// ─── Audit logs ───────────────────────────────────────────────────────────────
export async function writeAuditLog(action, targetType, targetId, prevVal = "", newVal = "") {
  let operatorId = "system";
  let operatorEmail = "system@hotelsnearme.com";

  try {
    const userJson = localStorage.getItem("hbooking_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      operatorId = user.uid || user.email;
      operatorEmail = user.email;
    }
  } catch (e) { /* ignore */ }

  const log = {
    log_id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    operator_id: operatorId,
    operator_email: operatorEmail,
    action,
    target_type: targetType,
    target_id: targetId,
    previous_value: prevVal,
    new_value: newVal
  };

  await supabase.from('audit_logs').insert(log);
}

// ─── Hotels ─────────────────────────────────────────────────────────────────
export async function addHotel(hotel) {
  const { error } = await supabase.from('hotels').insert({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    district: hotel.district,
    category: hotel.category,
    rating: hotel.rating || 4.5,
    reviews_count: hotel.reviewsCount || 0,
    price: hotel.price,
    tax: hotel.tax,
    image: hotel.image,
    images: hotel.images || [],
    map_url: hotel.mapUrl || '',
    whatsapp: hotel.whatsapp,
    distance: hotel.distance || '',
    badge: hotel.badge || 'Newly Added',
    description: hotel.description,
    amenities: hotel.amenities || [],
    highlights: hotel.highlights || [],
    details: hotel.details || {},
    nearby: hotel.nearby || [],
    featured: hotel.featured || false,
    trending: hotel.trending || false,
    status: hotel.status || 'active'
  });
  if (error) throw error;
  await writeAuditLog("ADD_HOTEL", "hotel", hotel.id, "", JSON.stringify(hotel));
  await refreshAllData();

  // Automatically notify Google and search engine crawlers of the new hotel
  try {
    if (typeof window !== "undefined" && window.fetch) {
      fetch("https://www.google.com/ping?sitemap=https://www.hotelsnearmeinkerala.com/sitemap.xml", { mode: "no-cors" }).catch(() => {});
    }
  } catch (e) { /* ignore ping errors */ }
}

export async function updateHotel(hotelId, updates) {
  const old = store.hotels.find((h) => h.id === hotelId);
  const dbUpdates = {};
  for (const key of Object.keys(updates)) {
    const dbKey = hotelsKeyMap[key] || key;
    dbUpdates[dbKey] = updates[key];
  }
  const { error } = await supabase.from('hotels').update(dbUpdates).eq('id', hotelId);
  if (error) throw error;
  await writeAuditLog("UPDATE_HOTEL", "hotel", hotelId, old ? JSON.stringify(old) : "", JSON.stringify(updates));
  await refreshAllData();
}

export async function deleteHotel(hotelId) {
  const old = store.hotels.find((h) => h.id === hotelId);
  const { error } = await supabase.from('hotels').delete().eq('id', hotelId);
  if (error) throw error;
  await writeAuditLog("DELETE_HOTEL", "hotel", hotelId, old ? JSON.stringify(old) : "", "");
  await refreshAllData();
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function addBooking(booking) {
  booking.createdAt = new Date().toISOString();
  const { error } = await supabase.from('bookings').insert({
    booking_id: booking.bookingId,
    hotel_id: booking.hotelId,
    hotel_name: booking.hotelName,
    user_id: booking.userId,
    user_name: booking.guestName || booking.userName,
    user_email: booking.userEmail,
    user_phone: booking.guestPhone || booking.userPhone,
    room_type: booking.roomType,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    guests: booking.guestsRooms || booking.guests,
    rooms_count: booking.roomsCount || 1,
    total_price: booking.amount || booking.totalPrice || 0,
    status: booking.status || 'pending'
  });
  if (error) throw error;
  await writeAuditLog("ADD_BOOKING", "booking", booking.bookingId, "", JSON.stringify(booking));
  await refreshAllData();
}

export async function updateBookingStatus(bookingId, updates) {
  const old = store.bookings.find((b) => b.bookingId === bookingId);
  const patch = typeof updates === "string" ? { status: updates } : updates;
  const dbUpdates = {};
  for (const key of Object.keys(patch)) {
    const dbKey = bookingsKeyMap[key] || key;
    dbUpdates[dbKey] = patch[key];
  }
  const { error } = await supabase.from('bookings').update(dbUpdates).eq('booking_id', bookingId);
  if (error) throw error;
  await writeAuditLog("UPDATE_BOOKING", "booking", bookingId, old ? JSON.stringify(old) : "", JSON.stringify(patch));
  await refreshAllData();
}

export async function deleteBooking(bookingId) {
  const old = store.bookings.find((b) => b.bookingId === bookingId);
  const { error } = await supabase.from('bookings').delete().eq('booking_id', bookingId);
  if (error) throw error;
  await writeAuditLog("DELETE_BOOKING", "booking", bookingId, old ? JSON.stringify(old) : "", "");
  await refreshAllData();
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export async function addRoom(room) {
  const { error } = await supabase.from('rooms').insert({
    id: room.id,
    hotel_id: room.hotelId,
    hotel_name: room.hotelName,
    room_number: room.roomNumber,
    type: room.type,
    capacity: room.capacity,
    price: room.price,
    beds: room.beds,
    availability: room.availability || 'available',
    amenities: room.amenities || [],
    inventory: room.inventory
  });
  if (error) throw error;
  await writeAuditLog("ADD_ROOM", "room", room.id, "", JSON.stringify(room));
  await refreshAllData();
}

export async function updateRoom(roomId, updates) {
  const old = store.rooms.find((r) => r.id === roomId);
  const dbUpdates = {};
  for (const key of Object.keys(updates)) {
    const dbKey = roomsKeyMap[key] || key;
    dbUpdates[dbKey] = updates[key];
  }
  const { error } = await supabase.from('rooms').update(dbUpdates).eq('id', roomId);
  if (error) throw error;
  await writeAuditLog("UPDATE_ROOM", "room", roomId, old ? JSON.stringify(old) : "", JSON.stringify(updates));
  await refreshAllData();
}

export async function deleteRoom(roomId) {
  const old = store.rooms.find((r) => r.id === roomId);
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
  await writeAuditLog("DELETE_ROOM", "room", roomId, old ? JSON.stringify(old) : "", "");
  await refreshAllData();
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function addUser(user) {
  if (!store.users.some((u) => u.uid === user.uid)) {
    const { error } = await supabase.from('users').upsert({
      uid: user.uid,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      photo_url: user.photoURL || "",
      role: user.role || 'user',
      created_at: user.createdAt || new Date().toISOString().split("T")[0]
    }, { onConflict: 'uid' });
    if (error) {
      console.error("Failed to add user to Supabase:", error);
      if (error.code === '42501') {
        console.warn("Supabase Row Level Security (RLS) is blocking 'users' table upserts. Please disable RLS or add insert policies in your Supabase SQL editor.");
        return;
      }
      throw error;
    }
    await refreshAllData();
  }
}

export async function updateUserProfile(uid, updates) {
  const old = store.users.find((u) => u.uid === uid);
  const dbUpdates = {};
  for (const key of Object.keys(updates)) {
    const dbKey = usersKeyMap[key] || key;
    dbUpdates[dbKey] = updates[key];
  }
  const { error } = await supabase.from('users').update(dbUpdates).eq('uid', uid);
  if (error) {
    console.error("Failed to update user profile in Supabase:", error);
    if (error.code === '42501') {
      console.warn("Supabase Row Level Security (RLS) is blocking 'users' table updates. Please disable RLS or add update policies in your Supabase SQL editor.");
      return;
    }
    throw error;
  }
  await writeAuditLog("UPDATE_USER", "user", uid, old ? JSON.stringify(old) : "", JSON.stringify(updates));
  await refreshAllData();
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function addReview(review) {
  review.reviewId = "rev_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  review.createdAt = new Date().toISOString();
  review.status = "pending";
  review.replyText = review.replyText || "";

  const payload = {
    review_id: review.reviewId,
    hotel_id: review.hotelId,
    hotel_name: review.hotelName,
    user_id: review.userId,
    user_name: review.userName,
    user_photo: review.userPhoto,
    rating: review.rating,
    comment: review.comment || review.reviewText,
    reply_text: review.replyText || '',
    status: review.status || 'pending'
  };

  if (review.photos && review.photos.length > 0) {
    payload.photos = review.photos;
  }
  if (review.subRatings) {
    payload.sub_ratings = review.subRatings;
  }
  if (review.tripType) {
    payload.trip_type = review.tripType;
  }

  let { error } = await supabase.from('reviews').insert(payload);
  
  // If database table doesn't have the new optional columns yet, retry with base payload
  if (error && (error.message.includes('column') || error.code === '42703')) {
    const basePayload = {
      review_id: review.reviewId,
      hotel_id: review.hotelId,
      hotel_name: review.hotelName,
      user_id: review.userId,
      user_name: review.userName,
      user_photo: review.userPhoto,
      rating: review.rating,
      comment: review.comment || review.reviewText,
      reply_text: review.replyText || '',
      status: review.status || 'pending'
    };
    const retry = await supabase.from('reviews').insert(basePayload);
    error = retry.error;
  }

  if (error) throw error;
  await writeAuditLog("ADD_REVIEW", "review", review.reviewId, "", JSON.stringify(review));
  await refreshAllData();
}

export async function recalculateHotelRating(hotelId) {
  try {
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
    console.error('Failed to recalculate rating for hotel:', hotelId, err);
  }
}

export async function updateReviewStatus(reviewId, status) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  const { error } = await supabase.from('reviews').update({ status }).eq('review_id', reviewId);
  if (error) throw error;
  await writeAuditLog("UPDATE_REVIEW_STATUS", "review", reviewId, old ? JSON.stringify(old) : "", status);
  if (old) {
    await recalculateHotelRating(old.hotelId);
  }
  await refreshAllData();
}

export async function replyToReview(reviewId, replyText) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  const { error } = await supabase.from('reviews').update({ reply_text: replyText }).eq('review_id', reviewId);
  if (error) throw error;
  await writeAuditLog("REPLY_REVIEW", "review", reviewId, old ? JSON.stringify(old) : "", replyText);
  await refreshAllData();
}

export async function deleteReview(reviewId) {
  const old = store.reviews.find((r) => r.reviewId === reviewId);
  const { error } = await supabase.from('reviews').delete().eq('review_id', reviewId);
  if (error) throw error;
  await writeAuditLog("DELETE_REVIEW", "review", reviewId, old ? JSON.stringify(old) : "", "");
  if (old) {
    await recalculateHotelRating(old.hotelId);
  }
  await refreshAllData();
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export async function addCoupon(coupon) {
  coupon.code = coupon.code.toUpperCase();
  coupon.usageCount = coupon.usageCount || 0;
  const { error } = await supabase.from('coupons').insert({
    code: coupon.code,
    discount_percent: coupon.discountPercent,
    expiry_date: coupon.expiryDate,
    usage_limit: coupon.usageLimit || 100,
    usage_count: coupon.usageCount || 0,
    min_booking_amount: coupon.minBookingAmount || 0,
    status: coupon.status || 'active'
  });
  if (error) throw error;
  await writeAuditLog("ADD_COUPON", "coupon", coupon.code, "", JSON.stringify(coupon));
  await refreshAllData();
}

export async function updateCoupon(code, updates) {
  const old = store.coupons.find((c) => c.code === code);
  const dbUpdates = {};
  for (const key of Object.keys(updates)) {
    const dbKey = couponsKeyMap[key] || key;
    dbUpdates[dbKey] = updates[key];
  }
  const { error } = await supabase.from('coupons').update(dbUpdates).eq('code', code);
  if (error) throw error;
  await writeAuditLog("UPDATE_COUPON", "coupon", code, old ? JSON.stringify(old) : "", JSON.stringify(updates));
  await refreshAllData();
}

export async function deleteCoupon(code) {
  const old = store.coupons.find((c) => c.code === code);
  const { error } = await supabase.from('coupons').delete().eq('code', code);
  if (error) throw error;
  await writeAuditLog("DELETE_COUPON", "coupon", code, old ? JSON.stringify(old) : "", "");
  await refreshAllData();
}

// ─── System users ─────────────────────────────────────────────────────────────
export async function addSystemUser(user) {
  const id = "sys_" + Date.now();
  const { error } = await supabase.from('system_users').insert({
    id: id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    status: user.status || 'Active'
  });
  if (error) throw error;
  await writeAuditLog("ADD_SYSTEM_USER", "system_user", id, "", JSON.stringify(user));
  await refreshAllData();
}

export async function deleteSystemUser(id) {
  const old = store.system_users.find((u) => u.id === id);
  const { error } = await supabase.from('system_users').delete().eq('id', id);
  if (error) throw error;
  await writeAuditLog("DELETE_SYSTEM_USER", "system_user", id, old ? JSON.stringify(old) : "", "");
  await refreshAllData();
}

// ─── Favorites ────────────────────────────────────────────────────────────────
export async function getFavorites(userId) {
  const { data, error } = await supabase.from('favorites').select('*').eq('user_id', userId);
  if (error || !data) return [];
  return data.map(mapFavoriteRow);
}

export function subscribeFavorites(userId, callback) {
  let active = true;
  const poll = async () => {
    try {
      const list = await getFavorites(userId);
      if (active) callback(list);
    } catch (e) {
      console.warn("Favorites sync error:", e);
    }
  };
  poll();
  const interval = setInterval(poll, 4000);
  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function addFavorite(userId, hotelId) {
  const fav = {
    id: `${userId}_${hotelId}`,
    user_id: userId,
    hotel_id: hotelId,
    created_at: new Date().toISOString()
  };
  const { error } = await supabase.from('favorites').insert(fav);
  if (error) throw error;
  await refreshAllData();
}

export async function removeFavorite(userId, hotelId) {
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('hotel_id', hotelId);
  if (error) throw error;
  await refreshAllData();
}

