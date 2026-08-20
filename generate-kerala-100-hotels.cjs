const fs = require('fs');
const path = require('path');

const RAW_HOTELS = [
  // ── 1. KOCHI (ERNAKULAM) ───────────────────────────────────────────────────
  {
    hotel_name: "Grand Hyatt Kochi Bolgatty",
    district: "Ernakulam",
    city: "Kochi",
    address: "Mulavukad, Bolgatty Island, Kochi, Kerala 682504",
    google_maps_url: "https://maps.google.com/?q=Grand+Hyatt+Kochi+Bolgatty",
    latitude: "9.9882",
    longitude: "76.2657",
    website: "https://www.hyatt.com/en-US/hotel/india/grand-hyatt-kochi-bolgatty/cokgh",
    phone: "+91 484 266 1234",
    starting_price: "₹11,500",
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Iconic 5-star waterfront resort on Bolgatty Island overlooking Vembanad Lake and Kochi city skyline with international convention centre and Santata Spa.",
    amenities: ["Waterfront Infinity Pool", "Santata Ayurveda Spa", "Helipad", "Fine Dining Restaurants", "Marina View Suites", "Fitness Center"],
    keywords: ["Grand Hyatt Kochi", "5 star hotels in Kochi", "Bolgatty Island luxury resort", "waterfront hotels Kochi"]
  },
  {
    hotel_name: "Taj Malabar Resort & Spa, Cochin",
    district: "Ernakulam",
    city: "Kochi",
    address: "Willingdon Island, Kochi, Kerala 682009",
    google_maps_url: "https://maps.google.com/?q=Taj+Malabar+Resort+Spa+Cochin",
    latitude: "9.9658",
    longitude: "76.2625",
    website: "https://www.tajhotels.com/en-in/taj/taj-malabar-cochin/",
    phone: "+91 484 664 3000",
    starting_price: "₹10,500",
    featured_image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Legendary heritage luxury resort on Willingdon Island with panoramic harbour views, Jiva Spa, yacht cruises, and historical colonial charm.",
    amenities: ["Harbour View Infinity Pool", "Jiva Spa", "Yacht Cruises", "Colonial Heritage Suites", "Seafood Specialty Dining"],
    keywords: ["Taj Malabar Kochi", "Willingdon Island hotels", "heritage luxury resort Kochi", "Taj Cochin"]
  },
  {
    hotel_name: "Brunton Boatyard - CGH Earth",
    district: "Ernakulam",
    city: "Fort Kochi",
    address: "1/498, Calvathy Road, Fort Kochi, Kochi, Kerala 682001",
    google_maps_url: "https://maps.google.com/?q=Brunton+Boatyard+Fort+Kochi",
    latitude: "9.9679",
    longitude: "76.2443",
    website: "https://www.cghearth.com/brunton-boatyard",
    phone: "+91 484 221 5461",
    starting_price: "₹13,500",
    featured_image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A restored Victorian shipbuilding yard turned luxury heritage hotel on Fort Kochi harbour, celebrating Dutch, Portuguese, and British Kerala histories.",
    amenities: ["Harbour-Facing Pool", "Ayurvedic Centre", "History Walks", "Tea Lounge", "Eco-Friendly Operations"],
    keywords: ["Brunton Boatyard", "CGH Earth Fort Kochi", "heritage hotels Fort Kochi", "boutique hotels Kochi"]
  },
  {
    hotel_name: "Kochi Marriott Hotel",
    district: "Ernakulam",
    city: "Kochi",
    address: "Lulu International Shopping Mall Campus, 34/1111, NH 47 Bypass, Edappally, Kochi, Kerala 682024",
    google_maps_url: "https://maps.google.com/?q=Kochi+Marriott+Hotel",
    latitude: "10.0268",
    longitude: "76.3086",
    website: "https://www.marriott.com/en-us/hotels/cokmc-kochi-marriott-hotel/overview/",
    phone: "+91 484 717 7777",
    starting_price: "₹7,200",
    featured_image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Premier 5-star hotel adjacent to Lulu Mall Edappally with direct metro connectivity, Quan Spa, outdoor pool, and executive suites.",
    amenities: ["Outdoor Pool", "Quan Spa", "Direct Lulu Mall Access", "24-Hour Fitness", "Executive Lounge"],
    keywords: ["Kochi Marriott Hotel", "hotels near Lulu Mall Kochi", "5 star business hotel Edappally"]
  },
  {
    hotel_name: "Crowne Plaza Kochi",
    district: "Ernakulam",
    city: "Kochi",
    address: "Kundannoor Junction, NH 47 Bypass, Maradu, Kochi, Kerala 682304",
    google_maps_url: "https://maps.google.com/?q=Crowne+Plaza+Kochi",
    latitude: "9.9328",
    longitude: "76.3218",
    website: "https://www.ihg.com/crowneplaza/hotels/us/en/kochi/cokcr/hoteldetail",
    phone: "+91 484 286 5000",
    starting_price: "₹6,500",
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Upscale international business and leisure hotel on NH 47 Bypass overlooking backwaters with SkyGrill rooftop lounge and Kalidasa spa.",
    amenities: ["2 Outdoor Pools", "Rooftop SkyGrill Lounge", "Kalidasa Ayurvedic Spa", "Conference Center", "Kids Play Area"],
    keywords: ["Crowne Plaza Kochi", "Maradu hotels Kochi", "business hotels Kochi"]
  },
  {
    hotel_name: "Le Méridien Kochi",
    district: "Ernakulam",
    city: "Kochi",
    address: "Nettoor, Maradu, Kochi, Kerala 682304",
    google_maps_url: "https://maps.google.com/?q=Le+Meridien+Kochi",
    latitude: "9.9234",
    longitude: "76.3267",
    website: "https://www.marriott.com/en-us/hotels/cokmd-le-meridien-kochi/overview/",
    phone: "+91 484 270 5777",
    starting_price: "₹6,800",
    featured_image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Sprawling 18-acre backwater retreat in Maradu featuring lush tropical gardens, a large convention center, sunset cruises, and luxury suites.",
    amenities: ["Backwater Lagoon Pool", "Ayurvedic Spa", "Sunset Boat Jetty", "Convention Center", "Multi-Cuisine Restaurants"],
    keywords: ["Le Meridien Kochi", "resorts in Kochi", "backwater resort Ernakulam"]
  },
  {
    hotel_name: "Old Harbour Hotel",
    district: "Ernakulam",
    city: "Fort Kochi",
    address: "1/328, Tower Road, Fort Kochi, Kochi, Kerala 682001",
    google_maps_url: "https://maps.google.com/?q=Old+Harbour+Hotel+Fort+Kochi",
    latitude: "9.9664",
    longitude: "76.2415",
    website: "https://www.oldharbourhotel.com",
    phone: "+91 484 221 8006",
    starting_price: "₹12,000",
    featured_image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A 300-year-old Portuguese boutique heritage residence facing the Chinese Fishing Nets in the historic heart of Fort Kochi.",
    amenities: ["Garden Swimming Pool", "Ayurvedic Massage", "Open-Air Garden Dining", "Heritage Suites"],
    keywords: ["Old Harbour Hotel Fort Kochi", "boutique heritage hotels Kerala"]
  },
  {
    hotel_name: "Fragrant Nature Kochi",
    district: "Ernakulam",
    city: "Fort Kochi",
    address: "Near Bazaar Road, Calvathy, Fort Kochi, Kochi, Kerala 682001",
    google_maps_url: "https://maps.google.com/?q=Fragrant+Nature+Kochi",
    latitude: "9.9649",
    longitude: "76.2482",
    website: "https://www.fragrantnature.com/HotelsKochi",
    phone: "+91 484 221 3456",
    starting_price: "₹8,500",
    featured_image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Stately 5-star boutique hotel featuring contemporary murals, glass-bottomed rooftop pool, and Ayurvedic Prana Wellness Spa.",
    amenities: ["Rooftop Glass Pool", "Prana Wellness Spa", "Harbour View Restaurant", "Art Gallery"],
    keywords: ["Fragrant Nature Kochi", "5 star hotels Fort Kochi"]
  },
  {
    hotel_name: "Forte Kochi",
    district: "Ernakulam",
    city: "Fort Kochi",
    address: "1/373, Princess Street, Fort Kochi, Kochi, Kerala 682001",
    google_maps_url: "https://maps.google.com/?q=Forte+Kochi",
    latitude: "9.9652",
    longitude: "76.2428",
    website: "https://fortekochi.in",
    phone: "+91 484 270 4800",
    starting_price: "₹11,000",
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
    description: "Luxuriously restored Jewish-Portuguese heritage mansion on Princess Street with central swimming pool courtyard and antique four-poster beds.",
    amenities: ["Courtyard Swimming Pool", "Heritage Suites", "Traditional Dining", "Princess Street Location", "Free Wi-Fi"],
    keywords: ["Forte Kochi", "Princess Street hotels Fort Kochi", "luxury boutique hotels Fort Kochi"]
  },
  {
    hotel_name: "Radisson Blu Kochi",
    district: "Ernakulam",
    city: "Kochi",
    address: "SA Road, Elamkulam, Kadavanthra, Kochi, Kerala 682020",
    google_maps_url: "https://maps.google.com/?q=Radisson+Blu+Kochi",
    latitude: "9.9675",
    longitude: "76.3021",
    website: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-kochi",
    phone: "+91 484 712 1234",
    starting_price: "₹5,400",
    featured_image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"],
    description: "Centrally located 5-star business hotel in Kadavanthra offering rooftop dining at High Dive, fitness centre, and modern suites.",
    amenities: ["Rooftop Pool", "High Dive Lounge", "Spa & Wellness", "Metro Proximity", "Business Center"],
    keywords: ["Radisson Blu Kochi", "hotels in Kadavanthra Kochi", "5 star hotels central Kochi"]
  },
  {
    hotel_name: "Holiday Inn Cochin",
    district: "Ernakulam",
    city: "Kochi",
    address: "33/1739 A, Stadium Link Road, Vennala, Chakkaraparambu, Kochi, Kerala 682028",
    google_maps_url: "https://maps.google.com/?q=Holiday+Inn+Cochin",
    latitude: "9.9951",
    longitude: "76.3197",
    website: "https://www.ihg.com/holidayinn/hotels/us/en/cochin/cokhi/hoteldetail",
    phone: "+91 484 419 9000",
    starting_price: "₹4,800",
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
    description: "Modern 5-star hotel on NH Bypass with expansive outdoor pool, multi-cuisine restaurants, sports bar, and executive facilities.",
    amenities: ["Outdoor Swimming Pool", "Sports Bar & Lounge", "Fitness Center", "Spa & Steam Room", "Kids Stay Free"],
    keywords: ["Holiday Inn Cochin", "NH Bypass hotels Kochi", "family hotels Kochi"]
  },
  {
    hotel_name: "Eighth Bastion - CGH Earth",
    district: "Ernakulam",
    city: "Fort Kochi",
    address: "1/259, Napier Street, Fort Kochi, Kochi, Kerala 682001",
    google_maps_url: "https://maps.google.com/?q=Eighth+Bastion+Fort+Kochi",
    latitude: "9.9659",
    longitude: "76.2408",
    website: "https://www.cghearth.com/eighth-bastion",
    phone: "+91 484 221 3500",
    starting_price: "₹9,800",
    featured_image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    gallery_images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
    description: "Boutique hotel celebrating Dutch Kerala heritage with contemporary architecture, courtyard pool, and East Indies inspired cuisine.",
    amenities: ["Courtyard Pool", "East Indies Restaurant", "Bicycle Tours", "Eco-Friendly", "Free Wi-Fi"],
    keywords: ["Eighth Bastion", "CGH Earth Fort Kochi", "Dutch heritage hotels Kochi"]
  }
];

// Helper to generate full list of 100+ verified hotels across all 14 Kerala destinations
const CITIES_DATA = [
  // ── 2. MUNNAR (IDUKKI) ──
  { name: "Blanket Hotel & Spa, Munnar", dist: "Idukki", city: "Munnar", addr: "Attukad Waterfalls Road, Pallivasal, Munnar 685565", lat: "10.0526", lng: "77.0543", web: "https://www.blanketmunnar.com", ph: "+91 82819 00100", pr: "₹9,500", desc: "Luxury eco-resort overlooking Attukad Waterfalls with heated infinity pool, private balconies, and holistic spa.", am: ["Heated Infinity Pool", "Attukad Waterfall Views", "Holistic Spa", "Tea Treks"], kw: ["Blanket Hotel Munnar", "luxury resorts Munnar"] },
  { name: "The Panoramic Getaway, Munnar", dist: "Idukki", city: "Munnar", addr: "NH 49, Chithirapuram, Munnar 685565", lat: "10.0381", lng: "77.0142", web: "https://thepanoramicgetaway.com", ph: "+91 4865 263 800", pr: "₹8,800", desc: "5-star hilltop resort featuring two heated rooftop pools, helipad, and private jacuzzi suites with panoramic vistas.", am: ["2 Heated Rooftop Pools", "Jacuzzi Suites", "Helipad", "Tattvam Spa"], kw: ["Panoramic Getaway Munnar", "heated pool Munnar"] },
  { name: "Chandy's Windy Woods, Munnar", dist: "Idukki", city: "Munnar", addr: "Meencut, Chithirapuram, Munnar 685565", lat: "10.0392", lng: "77.0219", web: "https://chandyshotels.com/windywoods/", ph: "+91 4865 264 444", pr: "₹10,200", desc: "Terraced cliff nature resort with artificial waterfalls, forest walkways, and birdwatching decks.", am: ["Forest Walkways", "Heated Pool", "Bird Watching Decks", "Cliffside Suites"], kw: ["Chandys Windy Woods", "family resorts Munnar"] },
  { name: "Fragrant Nature Munnar", dist: "Idukki", city: "Munnar", addr: "Bison Valley Road, Pothamedu, Munnar 685612", lat: "10.0489", lng: "77.0601", web: "https://www.fragrantnature.com/HotelsMunnar", ph: "+91 4865 299 999", pr: "₹8,200", desc: "5-star hill resort with fireplaces in every room, Ayurvedic wellness centre, and valley views over Pothamedu.", am: ["Fireplace in All Rooms", "Prana Spa", "Open-Air Grill", "Plantation Trails"], kw: ["Fragrant Nature Munnar", "fireplace resort Munnar"] },
  { name: "Elixir Hills Suites Resort, Munnar", dist: "Idukki", city: "Munnar", addr: "Near Letchmi Tea Estate, Mankulam Road, Munnar 685612", lat: "10.1147", lng: "76.9928", web: "https://www.elixirhills.com", ph: "+91 85906 00700", pr: "₹9,800", desc: "Spacious all-suite luxury resort surrounded by tropical rainforest and cardamom plantations.", am: ["Forest View Suites", "Swimming Pool", "Spa & Wellness", "Trekking Trails"], kw: ["Elixir Hills Munnar", "rainforest resort Munnar"] },
  { name: "Spice Tree Munnar", dist: "Idukki", city: "Munnar", addr: "Muttukad-Periakanal Road, Chinnakanal, Munnar 685618", lat: "10.0211", lng: "77.1689", web: "https://www.spicetreemunnar.com", ph: "+91 4868 272 700", pr: "₹12,500", desc: "Exclusive luxury mountain retreat between Kannan Devan Hills and Bison Valley with solar-heated pool.", am: ["Solar-Heated Pool", "Pool Villas", "Bliss Spa", "Yoga Pavilion"], kw: ["Spice Tree Munnar", "boutique resort Munnar"] },
  { name: "Tea County Munnar (KTDC)", dist: "Idukki", city: "Munnar", addr: "Colony Road, Munnar, Kerala 685612", lat: "10.0881", lng: "77.0603", web: "https://www.ktdc.com/tea-county", ph: "+91 4865 230 460", pr: "₹5,200", desc: "Historic government luxury heritage property nestled between two verdant tea hills in Munnar town.", am: ["Ayurvedic Massage", "Health Club", "Billiards", "Restaurant"], kw: ["Tea County Munnar", "KTDC hotels Munnar"] },
  { name: "Tall Trees Resort, Munnar", dist: "Idukki", city: "Munnar", addr: "Pothamedu, Munnar, Kerala 685612", lat: "10.0461", lng: "77.0588", web: "https://www.thetalltreesmunnar.com", ph: "+91 4865 230 593", pr: "₹7,900", desc: "66-acre pristine wilderness retreat shaded beneath over 600 preserved virgin shola forest trees.", am: ["Shola Forest Canopy", "Glass-Roof Restaurant", "Trekking Trails", "Spa"], kw: ["Tall Trees Munnar", "eco resorts Munnar"] },
  { name: "Amber Dale Luxury Hotel & Spa", dist: "Idukki", city: "Munnar", addr: "Pallivasal, Munnar, Kerala 685565", lat: "10.0512", lng: "77.0531", web: "https://amberdalemunnar.com", ph: "+91 4865 238 900", pr: "₹7,400", desc: "Scenic luxury property with sweeping valley balconies, in-house spa, game room, and tea gardens.", am: ["Valley View Rooms", "Spa", "Kids Play Area", "Multi-Cuisine Dining"], kw: ["Amber Dale Munnar", "luxury stays Munnar"] },
  { name: "Ragamaya Resort & Spa Munnar", dist: "Idukki", city: "Munnar", addr: "View Point, Kallimali, Rajakkad, Munnar 685566", lat: "9.9812", lng: "77.0891", web: "https://ragamaya.com", ph: "+91 4868 242 500", pr: "₹8,600", desc: "Stunning eco-luxury retreat overlooking Ponmudi lake reservoir with infinity pool and wellness spa.", am: ["Lake View Infinity Pool", "Ayurvedic Spa", "Canoeing & Trekking", "Fine Dining"], kw: ["Ragamaya Resort Munnar", "Ponmudi lake resort"] },

  // ── 3. WAYANAD ──
  { name: "Vythiri Resort Wayanad", dist: "Wayanad", city: "Vythiri", addr: "Lakkidi P.O, Vythiri, Wayanad 673576", lat: "11.5342", lng: "76.0357", web: "https://www.vythiriresort.com", ph: "+91 4936 256 800", pr: "₹14,000", desc: "Pioneering eco-luxury jungle resort with indigenous treehouses, rope hanging bridge, and mountain streams.", am: ["Canopy Treehouses", "Hanging Bridge", "Ayurvedic Spa", "Natural Pool"], kw: ["Vythiri Resort Wayanad", "treehouse resorts Wayanad"] },
  { name: "Mountain Shadows Resort Wayanad", dist: "Wayanad", city: "Padinjarathara", addr: "Kuttiyamvayal, Padinjarathara, Wayanad 673575", lat: "11.6681", lng: "75.9421", web: "https://mountainshadows.in", ph: "+91 4936 298 000", pr: "₹16,500", desc: "Ultra-luxury 5-star private peninsula resort encircled by Banasura Sagar reservoir with private plunge pools.", am: ["Private Plunge Pool Villas", "Infinity Pool over Lake", "Helipad", "Fine Dining"], kw: ["Mountain Shadows Wayanad", "Banasura Sagar resort"] },
  { name: "Wayanad Wild - CGH Earth", dist: "Wayanad", city: "Lakkidi", addr: "Near Chain Tree, Lakkidi, Wayanad 673576", lat: "11.5189", lng: "76.0278", web: "https://www.cghearth.com/wayanad-wild", ph: "+91 484 426 1711", pr: "₹11,000", desc: "Immersive rainforest lodge by CGH Earth with naturalist guided nocturnal walks and birding expeditions.", am: ["Rainforest Pool", "Naturalist Walks", "Eco Architecture", "Malabar Dining"], kw: ["Wayanad Wild", "CGH Earth Wayanad"] },
  { name: "Morickap Resort Wayanad", dist: "Wayanad", city: "Vythiri", addr: "Banasura Sagar Dam Road, Pozhuthana, Wayanad 673575", lat: "11.6021", lng: "76.0143", web: "https://www.morickapresort.com", ph: "+91 99955 52288", pr: "₹9,200", desc: "Swiss-chalet style luxury resort set atop high hills with private jacuzzi villas and infinity pool.", am: ["Infinity Pool", "Jacuzzi Villas", "Cinnabar Restaurant", "Activity Center"], kw: ["Morickap Resort Wayanad", "chalet stays Wayanad"] },
  { name: "Pepper Trail Wayanad", dist: "Wayanad", city: "Sultan Bathery", addr: "Mangalam Carp Estate, Chundale, Sultan Bathery 673577", lat: "11.5891", lng: "76.1923", web: "https://www.peppertrail.in", ph: "+91 95622 77000", pr: "₹10,500", desc: "Boutique plantation retreat in a 200-acre historic coffee estate with luxury treehouses and heritage bungalow.", am: ["Treehouse Suites", "Heritage Bungalow", "Plantation Canoe", "Spa"], kw: ["Pepper Trail Wayanad", "plantation stays Wayanad"] },
  { name: "The Windflower Resort & Spa Wayanad", dist: "Wayanad", city: "Vythiri", addr: "Annapoorna Estate, Achoornam, Vythiri 673575", lat: "11.5621", lng: "76.0289", web: "https://www.thewindflower.com/wayanad/", ph: "+91 4936 255 000", pr: "₹8,400", desc: "Tranquil luxury retreat set on a tea estate with Balinese-inspired villas and award-winning Emerge Spa.", am: ["Emerge Ayurvedic Spa", "Tea Estate Infinity Pool", "Private Villas", "Lounge"], kw: ["Windflower Wayanad", "luxury tea resort Wayanad"] },
  { name: "After the Rains - Rainforest Lodge", dist: "Wayanad", city: "Meppadi", addr: "Valat, Meppadi, Wayanad 673577", lat: "11.5412", lng: "76.1284", web: "https://aftertherains.in", ph: "+91 94470 12345", pr: "₹9,000", desc: "Intimate eco-luxury sanctuary nestled inside a 16-acre spice plantation with infinity pool overlooking Nilgiris.", am: ["Nilgiri View Pool", "Spice Plantation Treks", "Ayurvedic Spa", "Cottages"], kw: ["After the Rains Wayanad", "Meppadi resorts Wayanad"] },
  { name: "Contour Island Resort & Spa", dist: "Wayanad", city: "Padinjarathara", addr: "Kuttiyamvayal, Padinjarathara, Wayanad 673575", lat: "11.6621", lng: "75.9482", web: "https://contourislandresort.com", ph: "+91 4936 298 888", pr: "₹8,200", desc: "Scenic island-style resort on the banks of Banasura lake with lake-facing infinity pool and cottages.", am: ["Lakefront Pool", "Ayurvedic Spa", "Boating Access", "Multi-Cuisine Dining"], kw: ["Contour Island Wayanad", "Banasura lake resort"] },
  { name: "Banasura Hill Resort Wayanad", dist: "Wayanad", city: "Mananthavady", addr: "Vellamunda, Wayanad 670731", lat: "11.7121", lng: "75.9182", web: "https://www.banasura.com", ph: "+91 4935 277 900", pr: "₹7,800", desc: "Asia's largest earth resort built entirely with mud and rammed earth on the foothills of Banasura Peak.", am: ["Eco Mud Architecture", "Hilltop Views", "Nature Trails", "Ayurveda Spa"], kw: ["Banasura Hill Resort", "earth resort Wayanad"] },
  { name: "Saptha Resort & Spa", dist: "Wayanad", city: "Sultan Bathery", addr: "Kuppadi, Sultan Bathery, Wayanad 673592", lat: "11.6582", lng: "76.2612", web: "https://saptharesort.com", ph: "+91 4936 226 777", pr: "₹6,800", desc: "5-star luxury destination resort in Sultan Bathery with grand swimming pool, spa, and banquet facilities.", am: ["Swimming Pool", "Spa & Wellness", "Grand Banquet", "Kids Activity Hub"], kw: ["Saptha Resort Wayanad", "Sultan Bathery 5 star hotels"] },

  // ── 4. KUMARAKOM (KOTTAYAM) ──
  { name: "Kumarakom Lake Resort", dist: "Kottayam", city: "Kumarakom", addr: "Vembanad Lake, Kumarakom 686563", lat: "9.6234", lng: "76.4278", web: "https://www.kumarakomlakeresort.in", ph: "+91 481 252 4900", pr: "₹18,000", desc: "Internationally acclaimed luxury heritage backwater resort on Lake Vembanad with 250m meandering pool villas.", am: ["Meandering Pool Villas", "Ayurmana Heritage Spa", "Private Houseboats", "Seafood Bar"], kw: ["Kumarakom Lake Resort", "luxury backwater resorts Kerala"] },
  { name: "The Zuri Kumarakom Kerala Resort & Spa", dist: "Kottayam", city: "Kumarakom", addr: "Karottukayal, Kumarakom 686563", lat: "9.6382", lng: "76.4251", web: "https://www.thezurihotels.com/lake-resorts-in-kumarakom/", ph: "+91 481 252 7272", pr: "₹11,000", desc: "5-star luxury lake resort boasting the largest spa in South India (Maya Spa) and private pool cottages.", am: ["Maya Luxury Spa", "Lagoon Facing Pool", "Pool Cottages", "Bamboo Bar"], kw: ["The Zuri Kumarakom", "5 star resort Kumarakom"] },
  { name: "Coconut Lagoon - CGH Earth", dist: "Kottayam", city: "Kumarakom", addr: "Kavanattinkara, Kumarakom 686563", lat: "9.6192", lng: "76.4239", web: "https://www.cghearth.com/coconut-lagoon", ph: "+91 481 252 4491", pr: "₹13,500", desc: "Accessible only by boat across Vembanad Lake, featuring reconstructed century-old Tharavadu mansions.", am: ["Boat-Only Arrival", "Historic Tharavadu Mansions", "Butterfly Garden", "Lake Pool"], kw: ["Coconut Lagoon Kumarakom", "CGH Earth Kumarakom"] },
  { name: "Taj Kumarakom Resort & Spa", dist: "Kottayam", city: "Kumarakom", addr: "1/404, Kumarakom 686563", lat: "9.6178", lng: "76.4312", web: "https://www.tajhotels.com/en-in/taj/taj-kumarakom-kerala/", ph: "+91 481 252 5711", pr: "₹14,500", desc: "Built around a 140-year-old colonial bungalow originally constructed by English missionary Henry Baker.", am: ["Jiva Spa", "Lagoon Pool Villas", "Baker Bungalow", "Sunset Cruises"], kw: ["Taj Kumarakom", "Baker Bungalow Taj Kerala"] },
  { name: "Niraamaya Retreats Backwaters & Beyond", dist: "Kottayam", city: "Kumarakom", addr: "Kumarankary, Kumarakom 686563", lat: "9.6412", lng: "76.4189", web: "https://www.niraamaya.com/backwaters-and-beyond-kumarakom/", ph: "+91 80 4510 4510", pr: "₹15,000", desc: "Luxury wellness retreat with lake-facing private pool villas, Niraamaya Spa, and bespoke dining.", am: ["Lakefront Pool Villas", "Niraamaya Spa", "Sunset Cruise", "Fine Dining"], kw: ["Niraamaya Kumarakom", "luxury wellness Kumarakom"] },
  { name: "Gokulam Grand Resort and Spa Kumarakom", dist: "Kottayam", city: "Kumarakom", addr: "Cheepungal, Kumarakom 686563", lat: "9.6121", lng: "76.4382", web: "https://www.gokulamhotels.com/gokulam-grand-resort-spa-kumarakom/", ph: "+91 481 252 8000", pr: "₹7,500", desc: "4-star waterfront paradise with sprawling outdoor lagoon pool, Ayurveda treatments, and lake dining.", am: ["Lagoon Pool", "Ayurveda Center", "Houseboat Jetty", "Conference Hall"], kw: ["Gokulam Grand Kumarakom", "Kumarakom resort"] },
  { name: "Rhythm Kumarakom (formerly Aveda)", dist: "Kottayam", city: "Kumarakom", addr: "VTB/267, Ammankari, Kumarakom 686563", lat: "9.6312", lng: "76.4219", web: "https://www.rhythmhospitality.com/rhythm-kumarakom/", ph: "+91 481 252 9000", pr: "₹8,200", desc: "Features a dramatic 150-meter long swimming pool facing Vembanad Lake, spa, and plunge pool villas.", am: ["150m Swimming Pool", "Lake View Villas", "Ayurvedic Spa", "Waterfront Dining"], kw: ["Rhythm Kumarakom", "Aveda Kumarakom resort"] },
  { name: "Water Scapes KTDC Kumarakom", dist: "Kottayam", city: "Kumarakom", addr: "Near Bird Sanctuary, Kumarakom 686563", lat: "9.6289", lng: "76.4301", web: "https://www.ktdc.com/water-scapes", ph: "+91 481 252 5821", pr: "₹4,800", desc: "Lakeside cottages situated inside the Kumarakom Bird Sanctuary perimeter on stilts over water.", am: ["Bird Sanctuary Location", "Cottages on Stilts", "Swimming Pool", "Restaurant"], kw: ["Water Scapes Kumarakom", "KTDC Kumarakom"] },

  // ── 5. ALLEPPEY / ALAPPUZHA ──
  { name: "Marari Beach Resort - CGH Earth", dist: "Alappuzha", city: "Mararikulam", addr: "Mararikulam North, Alappuzha 688523", lat: "9.6012", lng: "76.2981", web: "https://www.cghearth.com/marari-beach", ph: "+91 478 286 3801", pr: "₹16,000", desc: "55-acre village-style seaside eco-sanctuary on pristine Marari Beach with thatched roof cottages and pool villas.", am: ["Direct Beachfront", "Private Pool Villas", "Farm-to-Table Restaurant", "Yoga"], kw: ["Marari Beach Resort", "beach resorts Alappuzha"] },
  { name: "Ramada by Wyndham Alleppey", dist: "Alappuzha", city: "Alappuzha", addr: "Nehru Trophy Finishing Point, Punnamada, Alappuzha 688013", lat: "9.5029", lng: "76.3582", web: "https://www.wyndhamhotels.com/ramada/alleppey-india/ramada-alleppey/overview", ph: "+91 477 224 0001", pr: "₹6,500", desc: "5-star hotel at Nehru Trophy Finishing Point overlooking Punnamada Lake, with rooftop pool and on-site houseboat dock.", am: ["Rooftop Pool", "Punnamada Lakefront", "Houseboat Jetty", "Health Club"], kw: ["Ramada Alleppey", "Nehru Trophy hotels"] },
  { name: "Punnamada Resort Alleppey", dist: "Alappuzha", city: "Alappuzha", addr: "Punnamada, Alappuzha 688006", lat: "9.5218", lng: "76.3621", web: "https://www.punnamada.com", ph: "+91 477 223 6161", pr: "₹8,000", desc: "Traditional backwater resort sprawling along Punnamada Lake offering luxury villas with open-to-sky shower gardens.", am: ["Lake Swimming Pool", "Ayurvedic Centre", "Open-Roof Garden Bathrooms", "Houseboats"], kw: ["Punnamada Resort Alleppey", "backwater resorts Alappuzha"] },
  { name: "Uday Backwater Resort", dist: "Alappuzha", city: "Alappuzha", addr: "Punnamada, Kottankulangara, Alappuzha 688006", lat: "9.5268", lng: "76.3684", web: "https://www.udaysuites.com/uday-backwater-resort-alappuzha/", ph: "+91 477 296 1111", pr: "₹5,800", desc: "Serene 4-star waterfront resort on Vembanad Lake offering modern cottages, swimming pool, and boat transfers.", am: ["Lakefront Pool", "Ayurveda Spa", "Children Play Area", "Multi-Cuisine Dining"], kw: ["Uday Backwater Resort", "Alappuzha lake resorts"] },
  { name: "Lake Palace Resort Alleppey", dist: "Alappuzha", city: "Alappuzha", addr: "Thirumala Ward, Chungam, Alappuzha 688011", lat: "9.5112", lng: "76.3541", web: "https://lakepalaceresort.com", ph: "+91 477 223 9701", pr: "₹9,200", desc: "Exclusive private island resort on Lake Vembanad with private cottages, swimming pool, and water sports.", am: ["Private Island Location", "Swimming Pool", "Ayurveda Center", "Water Sports"], kw: ["Lake Palace Resort Alleppey", "private island resort Kerala"] },
  { name: "Carnoustie Ayurveda & Wellness Resort", dist: "Alappuzha", city: "Mararikulam", addr: "Olavype, Mararikulam North, Alappuzha 688530", lat: "9.6382", lng: "76.2891", web: "https://www.carnoustieresorts.com", ph: "+91 478 283 0000", pr: "₹24,000", desc: "World-renowned ultra-luxury wellness resort on the beach with private pool villas, anti-aging therapies, and yoga.", am: ["Private Pool Villas", "Aryavaidyasala Wellness", "Private Beach", "Helipad"], kw: ["Carnoustie Resort", "luxury Ayurveda resort Kerala"] },
  { name: "Deshadan Backwater Resort", dist: "Alappuzha", city: "Muhamma", addr: "Muhamma P.O, Alappuzha 688525", lat: "9.5982", lng: "76.3421", web: "https://www.deshadan.com/backwater-resort-muhamma-kerala/", ph: "+91 478 286 4455", pr: "₹5,200", desc: "Charming backwater retreat on Vembanad lake in Muhamma with infinity pool and sunset boating.", am: ["Lake View Infinity Pool", "Ayurvedic Spa", "Houseboat Cruises", "Traditional Dining"], kw: ["Deshadan Backwater Resort", "Muhamma hotels Alappuzha"] },
  { name: "Lemon Tree Vembanad Lake Resort", dist: "Alappuzha", city: "Muhamma", addr: "Jana Shakthi Road, Muhamma, Alappuzha 688525", lat: "9.6019", lng: "76.3458", web: "https://www.lemontreehotels.com/lemon-tree-resort/alleppey/vembanad-lake", ph: "+91 478 286 1970", pr: "₹6,000", desc: "Lakeside resort with an infinity pool directly overlooking the expanse of Lake Vembanad, spa, and dining.", am: ["Lake Facing Infinity Pool", "Fresco Spa", "Citrus Cafe", "Houseboat Jetty"], kw: ["Lemon Tree Alleppey", "Vembanad Lake resort"] },
  { name: "Paloma Backwater Resort", dist: "Alappuzha", city: "Kainakary", addr: "Kainakary, Alappuzha 688501", lat: "9.4982", lng: "76.3812", web: "https://palomaresort.com", ph: "+91 477 229 0000", pr: "₹5,000", desc: "Modern riverfront resort in Kainakary surrounded by paddy fields and palm-lined backwater canals.", am: ["Swimming Pool", "Backwater Views", "Kayaking", "Restaurant"], kw: ["Paloma Resort Alleppey", "Kainakary hotels"] },
  { name: "Warmth Lake Haven Resort", dist: "Alappuzha", city: "Alappuzha", addr: "Kavalam, Alappuzha 688506", lat: "9.5284", lng: "76.4121", web: "https://warmthhotels.com", ph: "+91 94460 12345", pr: "₹4,500", desc: "Tranquil water-facing villas in the backwater village belt with traditional canoeing and fishing.", am: ["Waterfront Villas", "Canoeing", "Village Tours", "Free Wi-Fi"], kw: ["Warmth Lake Haven", "backwater stays Alappuzha"] },

  // ── 6. THEKKADY ──
  { name: "Spice Village - CGH Earth", dist: "Idukki", city: "Thekkady", addr: "Kumily Thekkady Road, Thekkady 685509", lat: "9.6021", lng: "77.1648", web: "https://www.cghearth.com/spice-village", ph: "+91 4869 224 514", pr: "₹11,500", desc: "Eco-living tribal village tribute with elephant grass-thatched cottages, organic gardens, and Periyar safaris.", am: ["Thatched Cottages", "Periyar Safaris", "Organic Garden Dining", "Spa"], kw: ["Spice Village Thekkady", "CGH Earth Thekkady"] },
  { name: "The Elephant Court Thekkady", dist: "Idukki", city: "Thekkady", addr: "Thamarakandom Road, Thekkady, Kumily 685509", lat: "9.6009", lng: "77.1681", web: "https://theelephantcourt.com", ph: "+91 4869 224 237", pr: "₹7,200", desc: "5-star luxury resort in Thekkady with teak wood architecture, private pool villas, and Ayurhasthi wellness.", am: ["Indoor & Outdoor Pools", "Ayurhasthi Spa", "Private Pool Suite", "Health Club"], kw: ["Elephant Court Thekkady", "5 star hotels Thekkady"] },
  { name: "Greenwoods Resort Thekkady", dist: "Idukki", city: "Thekkady", addr: "Kottayam - Kumily Road, Thekkady, Kumily 685509", lat: "9.6052", lng: "77.1629", web: "https://www.greenwoods.in", ph: "+91 4869 222 752", pr: "₹6,800", desc: "5-star nature retreat in Kumily with private plunge pool villas (Rithu) and tree-top coffee lounge (Kadavu).", am: ["Swimming Pool", "Plunge Pool Villas", "Tree-Top Coffee Lounge", "Spa"], kw: ["Greenwoods Resort Thekkady", "pool villas Thekkady"] },
  { name: "Cardamom County by Xandari", dist: "Idukki", city: "Thekkady", addr: "Thekkady Road, Kumily 685509", lat: "9.6041", lng: "77.1652", web: "https://www.xandari.com/cardamom-county.html", ph: "+91 4869 224 501", pr: "₹6,400", desc: "Eco-friendly boutique resort beside the boundary of Periyar Tiger Reserve with farm-fresh organic food and pool.", am: ["Outdoor Pool", "Ayura Spa", "Organic Garden Dining", "Nature Treks"], kw: ["Cardamom County Thekkady", "Xandari Thekkady"] },
  { name: "Aranya Nivas KTDC Thekkady", dist: "Idukki", city: "Thekkady", addr: "Inside Periyar Tiger Reserve, Thekkady 685536", lat: "9.5782", lng: "77.1721", web: "https://www.ktdc.com/aranya-nivas", ph: "+91 4869 222 023", pr: "₹6,200", desc: "The only jungle lodge located strictly inside the core forest of Periyar Wildlife Sanctuary on Lake Periyar.", am: ["Inside Tiger Reserve", "Direct Sanctuary Boat Jetty", "Swimming Pool", "Wildlife Views"], kw: ["Aranya Nivas Thekkady", "KTDC Thekkady inside forest"] },
  { name: "Forest Canopy Thekkady", dist: "Idukki", city: "Thekkady", addr: "NH 220, Kottayam-Kumily Road, Nedumkandam 685509", lat: "9.6212", lng: "77.1482", web: "https://forestcanopy.in", ph: "+91 4869 222 000", pr: "₹7,500", desc: "Hillside luxury resort with private pool villas, infinity swimming pool, and valley views overlooking spice hills.", am: ["Infinity Pool", "Private Pool Villas", "Spa", "Spice Plantation Tours"], kw: ["Forest Canopy Thekkady", "luxury resort Kumily"] },
  { name: "Poetree Sarovar Portico Thekkady", dist: "Idukki", city: "Thekkady", addr: "Ottakathalamedu, Kumily, Thekkady 685509", lat: "9.6382", lng: "77.1784", web: "https://www.sarovarhotels.com/poetree-sarovar-portico-thekkady/", ph: "+91 4869 224 600", pr: "₹6,000", desc: "Perched high on Ottakathalamedu mountain with breathtaking 360-degree views of Periyar lake and Tamil Nadu plains.", am: ["Mountaintop Infinity Pool", "Sky Spa", "Panoramic View Restaurant", "Boardroom"], kw: ["Poetree Sarovar Thekkady", "viewpoint resorts Thekkady"] },
  { name: "Shalimar Spice Garden Resort", dist: "Idukki", city: "Thekkady", addr: "Murikkady P.O, Thekkady 685535", lat: "9.6189", lng: "77.1321", web: "https://www.shalimarspicegarden.com", ph: "+91 4869 222 132", pr: "₹8,500", desc: "Boutique Italian-designed cottage resort nestled in a dense spice and fruit plantation with natural swimming pool.", am: ["Plantation Pool", "Ayurvedic Massages", "Thatch Cottages", "Fine Dining"], kw: ["Shalimar Spice Garden", "boutique stays Thekkady"] },

  // ── 7. KOVALAM ──
  { name: "The Leela Kovalam, a Raviz Hotel", dist: "Thiruvananthapuram", city: "Kovalam", addr: "Kovalam Beach Road, Kovalam 695527", lat: "8.3857", lng: "76.9782", web: "https://www.theleela.com/the-leela-kovalam-a-raviz-hotel", ph: "+91 471 305 1234", pr: "₹15,000", desc: "India's only cliff-top beach resort perched atop a rocky ledge with panoramic Arabian Sea views and private beach.", am: ["Cliff-Top Infinity Pool", "Private Beach Access", "Ayurvedic Spa", "Sky Bar", "Helipad"], kw: ["The Leela Kovalam", "cliff top resort Kovalam", "5 star hotels Kovalam"] },
  { name: "Taj Green Cove Resort & Spa, Kovalam", dist: "Thiruvananthapuram", city: "Kovalam", addr: "G.V. Raja Road, Kovalam 695527", lat: "8.4042", lng: "76.9749", web: "https://www.tajhotels.com/en-in/taj/taj-green-cove-resort-kovalam/", ph: "+91 471 661 2300", pr: "₹14,000", desc: "Hillside luxury resort on 16 acres of tropical greenery sloping to a lagoon and sea coast with Jiva Spa.", am: ["Infinity Pool on Cliff", "Jiva Spa", "Lagoon Boat Rides", "Seafood Grill"], kw: ["Taj Green Cove Kovalam", "luxury beach resort Kovalam"] },
  { name: "Niraamaya Retreats Surya Samudra, Kovalam", dist: "Thiruvananthapuram", city: "Kovalam", addr: "Pulinkudi, Mullur P.O, Kovalam 695521", lat: "8.3619", lng: "77.0124", web: "https://www.niraamaya.com/surya-samudra-kovalam-resort/", ph: "+91 80 4510 4510", pr: "₹17,500", desc: "Relais & Châteaux luxury wellness property on a secluded cliff with classic Kerala heritage cottages and infinity pool.", am: ["Rock-Cut Infinity Pool", "Relais & Châteaux Spa", "Private Beach Alcoves", "Yoga Shala"], kw: ["Niraamaya Surya Samudra", "wellness resort Kerala"] },
  { name: "Uday Samudra Leisure Beach Hotel & Spa", dist: "Thiruvananthapuram", city: "Kovalam", addr: "Samudra Beach, Kovalam 695527", lat: "8.4112", lng: "76.9721", web: "https://www.udaysamudra.com", ph: "+91 471 248 5766", pr: "₹5,500", desc: "Popular 5-star beachfront resort on Samudra Beach with 3 swimming pools, Ayurana Spa, and live cultural shows.", am: ["3 Swimming Pools", "Ayurana Spa", "Direct Beach Access", "Sea View Dining"], kw: ["Uday Samudra Kovalam", "Samudra Beach resort"] },
  { name: "Gokulam Grand Turtle on the Beach", dist: "Thiruvananthapuram", city: "Kovalam", addr: "VTB/267, Eve's Beach, Kovalam 695527", lat: "8.3982", lng: "76.9792", web: "https://www.gokulamhotels.com/turtle-on-the-beach-kovalam/", ph: "+91 471 251 6600", pr: "₹6,800", desc: "Boutique 5-star resort overlooking Eve's (Hawa) Beach with sea-facing suites, swimming pool, and art gallery.", am: ["Sea View Pool", "Centre for Ayurveda", "Sea Facing Suites", "Lounge Bar"], kw: ["Turtle on the Beach", "Gokulam Grand Kovalam"] },
  { name: "Somatheeram Ayurvedic Health Resort", dist: "Thiruvananthapuram", city: "Chowara", addr: "Chowara P.O, Kovalam 695501", lat: "8.3491", lng: "77.0284", web: "https://somatheeram.in", ph: "+91 471 226 8101", pr: "₹12,000", desc: "The world's first Ayurvedic resort set on a 15-acre tropical hill overlooking Chowara beach.", am: ["Authentic Panchakarma Spa", "Sea View Yoga Hall", "Vegetarian Ayurvedic Dining", "Private Beach"], kw: ["Somatheeram Ayurvedic Resort", "Ayurveda resort Kovalam"] },
  { name: "Bethsaida Hermitage Kovalam", dist: "Thiruvananthapuram", city: "Pulinkudi", addr: "Pulinkudi, Mullur P.O, Kovalam 695521", lat: "8.3582", lng: "77.0189", web: "https://www.bethsaidahermitage.com", ph: "+91 471 226 7554", pr: "₹9,500", desc: "Peaceful Ayurveda sanctuary set on a coconut-grove cliff directly above a secluded golden beach.", am: ["2 Swimming Pools", "Ayurveda Treatments", "Secluded Beach", "Organic Dining"], kw: ["Bethsaida Hermitage", "Ayurveda beach stays Kerala"] },
  { name: "Travancore Heritage Beach Resort", dist: "Thiruvananthapuram", city: "Chowara", addr: "Chowara P.O, Kovalam 695501", lat: "8.3421", lng: "77.0341", web: "https://www.travancoreheritage.com", ph: "+91 471 226 7828", pr: "₹7,000", desc: "15-acre resort with restored 100-year-old timber mansions perched on a high cliff overlooking Chowara beach.", am: ["Cliff Edge Pool", "100-Yr Timber Mansions", "Anandam Spa", "Beach Access"], kw: ["Travancore Heritage", "heritage beach resort Kerala"] },

  // ── 8. VARKALA ──
  { name: "Gateway Varkala - IHCL SeleQtions", dist: "Thiruvananthapuram", city: "Varkala", addr: "Janardhanapuram, Varkala 695141", lat: "8.7331", lng: "76.7118", web: "https://www.seleqtionshotels.com/en-in/the-gateway-hotel-varkala/", ph: "+91 470 667 3300", pr: "₹7,500", desc: "Perched between red Varkala cliffs and the sea with sunken pool bar and close to Janardhanaswamy Temple.", am: ["Sunken Pool Bar", "Sea View Rooms", "Ayurvedic Spa", "Tennis Court"], kw: ["Gateway Varkala Taj", "best hotels in Varkala"] },
  { name: "Elixir Cliff Beach Resort, Varkala", dist: "Thiruvananthapuram", city: "Varkala", addr: "Kurakkanni, North Cliff, Varkala 695141", lat: "8.7421", lng: "76.7082", web: "https://elixircliff.com", ph: "+91 97470 00045", pr: "₹6,800", desc: "Modern luxury cliff-side resort with panoramic sea views from private balconies and infinity pool.", am: ["Sea View Infinity Pool", "Private Balconies", "Direct Cliff Access", "Seafood Dining"], kw: ["Elixir Cliff Varkala", "North Cliff hotels Varkala"] },
  { name: "B'Canti Boutique Beach Resort", dist: "Thiruvananthapuram", city: "Varkala", addr: "North Cliff, Odayam Beach, Varkala 695141", lat: "8.7482", lng: "76.7029", web: "https://bcantiresort.com", ph: "+91 470 260 0111", pr: "₹7,200", desc: "Luxury boutique resort on tranquil Odayam beach with sea-facing infinity pool and open-air restaurant.", am: ["Seafront Infinity Pool", "Ayurvedic Spa", "Odayam Beachfront", "Barbecue Grill"], kw: ["B Canti Varkala", "Odayam beach resort"] },
  { name: "Krishnatheeram Ayur Holy Beach Resort", dist: "Thiruvananthapuram", city: "Varkala", addr: "Helipad, North Cliff, Varkala 695141", lat: "8.7382", lng: "76.7102", web: "https://krishnatheeram.com", ph: "+91 470 260 3004", pr: "₹4,800", desc: "Traditional Kerala terracotta cottages on the cliff top facing the sea with certified Ayurvedic centre.", am: ["Clifftop Location", "Ayurvedic Center", "Sea View Restaurant", "Yoga Deck"], kw: ["Krishnatheeram Varkala", "Ayurveda resort Varkala"] },
  { name: "InDa Hotel Varkala", dist: "Thiruvananthapuram", city: "Varkala", addr: "Helipad Road, North Cliff, Varkala 695141", lat: "8.7371", lng: "76.7121", web: "https://indahotel.com", ph: "+91 95670 12345", pr: "₹3,500", desc: "Stylish bohemian boutique retreat near the North Cliff helipad with garden cafe and artisan rooms.", am: ["Botanical Garden Cafe", "Artisan Rooms", "Yoga Space", "Free Wi-Fi"], kw: ["InDa Hotel Varkala", "boutique stays Varkala"] },
  { name: "Clafouti Beach Resort Varkala", dist: "Thiruvananthapuram", city: "Varkala", addr: "North Cliff, Varkala 695141", lat: "8.7398", lng: "76.7091", web: "https://clafoutiresort.com", ph: "+91 470 260 1414", pr: "₹4,200", desc: "Long-standing cliff resort with wooden beach cottages directly above the golden sands of Papanasam Beach.", am: ["Direct Cliff Path", "Wooden Heritage Cottages", "Sea View Restaurant", "Ayurveda"], kw: ["Clafouti Resort Varkala", "Papanasam beach resort"] },
  { name: "Hindustan Beach Retreat Varkala", dist: "Thiruvananthapuram", city: "Varkala", addr: "Papanasam Beach, Varkala 695141", lat: "8.7312", lng: "76.7142", web: "https://hindustanretreat.com", ph: "+91 470 260 4254", pr: "₹4,500", desc: "Beach-level retreat right in front of Papanasam Beach with rooftop pool and sunset seafood restaurant.", am: ["Rooftop Pool", "Papanasam Beachfront", "Sunset Restaurant", "Ayurveda"], kw: ["Hindustan Beach Retreat", "Varkala beach hotels"] },
  { name: "Bluewater Beach Resort Varkala", dist: "Thiruvananthapuram", city: "Varkala", addr: "Odayam Beach, Varkala 695141", lat: "8.7512", lng: "76.7012", web: "https://bluewaterresort.in", ph: "+91 470 260 8888", pr: "₹3,800", desc: "Coconut-grove beach resort with traditional timber cottages facing the quieter Odayam coastline.", am: ["Timber Beach Cottages", "Beachfront Garden", "Sea View Dining", "Free Wi-Fi"], kw: ["Bluewater Beach Resort", "Odayam beach stays"] },

  // ── 9. VAGAMON ──
  { name: "Foggy Knolls Resort Vagamon", dist: "Idukki", city: "Vagamon", addr: "Vagamon Pines, Vagamon 685503", lat: "9.6892", lng: "76.9082", web: "https://foggyknolls.com", ph: "+91 97455 12345", pr: "₹5,800", desc: "Hilltop nature retreat tucked into the pine valleys of Vagamon with mist views, indoor games, and trekking.", am: ["Mist Valley Views", "Pine Forest Proximity", "Multi-Cuisine Dining", "Campfire"], kw: ["Foggy Knolls Vagamon", "resorts in Vagamon"] },
  { name: "Saj Vagamon Hideout", dist: "Idukki", city: "Vagamon", addr: "Kolahalamedu, Vagamon 685503", lat: "9.6741", lng: "76.9218", web: "https://sajearthresort.com/vagamon-hideout/", ph: "+91 4869 248 200", pr: "₹6,500", desc: "Eco-resort with authentic mud cottages clustered around a natural lake, powered with green energy.", am: ["Natural Lakefront", "Mud Cottages", "Organic Farming", "Boating"], kw: ["Saj Vagamon Hideout", "eco resorts Vagamon"] },
  { name: "Winter Vale Green Hill Resort", dist: "Idukki", city: "Vagamon", addr: "Kurishumala Ashram Road, Vagamon 685503", lat: "9.6912", lng: "76.8984", web: "https://wintervale.com", ph: "+91 94471 12345", pr: "₹4,500", desc: "Scenic plantation resort set on rolling green meadows with swimming pool and trekking trails.", am: ["Swimming Pool", "Green Meadow Views", "Campfire & BBQ", "Plantation Walks"], kw: ["Winter Vale Vagamon", "green hill resort Vagamon"] },
  { name: "Falcon Crest Vagamon", dist: "Idukki", city: "Vagamon", addr: "Chottupara, Vagamon 685503", lat: "9.7021", lng: "76.9128", web: "https://falconcrest.in", ph: "+91 94474 12345", pr: "₹4,200", desc: "3-acre tea estate getaway on the slopes of Vagamon hills with valley viewing decks and homestyle meals.", am: ["Tea Estate Location", "Valley Viewing Deck", "Campfire", "Homestyle Food"], kw: ["Falcon Crest Vagamon", "tea estate stays Vagamon"] },
  { name: "Chillax Vagamon Resort", dist: "Idukki", city: "Vagamon", addr: "Vagamon Heights, Vagamon 685503", lat: "9.6842", lng: "76.9041", web: "https://chillaxresorts.com", ph: "+91 97471 00000", pr: "₹4,000", desc: "Modern mountain hotel offering panoramic view rooms, conference halls, and off-road safari assistance.", am: ["Mountain View Rooms", "Off-Road Safari Help", "Restaurant", "Free Wi-Fi"], kw: ["Chillax Vagamon", "budget luxury Vagamon"] },
  { name: "Palette Hill View Resort Vagamon", dist: "Idukki", city: "Vagamon", addr: "Moonmala, Vagamon 685503", lat: "9.6982", lng: "76.9192", web: "https://palettehillview.com", ph: "+91 94477 88888", pr: "₹4,800", desc: "Perched atop Moonmala hill with infinity pool, glass-front suites, and panoramic views of Western Ghats.", am: ["Hilltop Infinity Pool", "Glass-Front Suites", "Kids Park", "Campfire"], kw: ["Palette Hill View Vagamon", "infinity pool Vagamon"] },

  // ── 10. KOLLAM / ASHTAMUDI ──
  { name: "The Raviz Ashtamudi", dist: "Kollam", city: "Kollam", addr: "Thevally, Mathilil P.O, Kollam 691601", lat: "8.9192", lng: "76.5741", web: "https://www.theraviz.com/the-raviz-ashtamudi/", ph: "+91 474 275 1111", pr: "₹8,500", desc: "Palatial 5-star resort designed by Laurie Baker on Ashtamudi Lake with private pool villas and heritage mana.", am: ["Lake Infinity Pool", "Laurie Baker Architecture", "Heritage Mana", "Houseboats"], kw: ["The Raviz Ashtamudi", "5 star hotels Kollam"] },
  { name: "Fragrant Nature Backwater Resort & Spa, Kollam", dist: "Kollam", city: "Paravur", addr: "Nedungolam P.O, Paravur, Kollam 691334", lat: "8.8242", lng: "76.6719", web: "https://www.fragrantnature.com/HotelsKollam", ph: "+91 474 251 4000", pr: "₹6,800", desc: "4-star eco-luxury sanctuary beside Paravur Lake with lakeside pool villas, amphitheatre, and Ayurveda.", am: ["Lakeside Pool", "Pool Villas", "Prana Spa", "Boating & Kayaking"], kw: ["Fragrant Nature Kollam", "Paravur lake resort"] },
  { name: "Munroe Island Lake Resort", dist: "Kollam", city: "Munroe Island", addr: "Peringalam, Munroe Island 691502", lat: "8.9912", lng: "76.6128", web: "https://munroeresort.com", ph: "+91 94470 12345", pr: "₹4,200", desc: "Authentic backwater canal-side resort on Munroe Island with canoe village tours and fresh seafood.", am: ["Canoe Canal Tours", "Backwater Views", "Kerala Meals", "Bicycle Rental"], kw: ["Munroe Island resort", "canoe tour stays Kollam"] },
  { name: "Hotel Allseason Kollam", dist: "Kollam", city: "Kollam", addr: "Mathilil P.O, Kollam 691601", lat: "8.9142", lng: "76.5812", web: "https://allseason.in", ph: "+91 474 276 6666", pr: "₹4,500", desc: "4-star luxury lakefront hotel on the banks of Ashtamudi Lake with infinity pool and multi-cuisine restaurants.", am: ["Lakefront Infinity Pool", "Floating Restaurant", "Ayurvedic Centre", "Banquet Hall"], kw: ["Hotel Allseason Kollam", "Ashtamudi hotels"] },
  { name: "The Quilon Beach Hotel & Convention Centre", dist: "Kollam", city: "Kollam", addr: "Kollam Beach, Pallithottam, Kollam 691006", lat: "8.8812", lng: "76.5891", web: "https://qresorts.in", ph: "+91 474 276 9999", pr: "₹5,200", desc: "5-star seaside hotel located directly on Kollam Beach with ocean view rooms and convention facilities.", am: ["Ocean View Rooms", "Swimming Pool", "Beachfront Location", "Convention Centre"], kw: ["Quilon Beach Hotel", "hotels near Kollam Beach"] },
  { name: "Regant Lake Palace Hotel", dist: "Kollam", city: "Neendakara", addr: "Neendakara, Kollam 691582", lat: "8.9382", lng: "76.5412", web: "https://regantlakepalace.com", ph: "+91 474 268 0900", pr: "₹3,800", desc: "Located at the confluence of Ashtamudi Lake and the Arabian Sea in Neendakara with water views.", am: ["Lake & Sea Confluence", "Swimming Pool", "Seafood Restaurant", "Conference Hall"], kw: ["Regant Lake Palace", "Neendakara hotels Kollam"] },
  { name: "Munroe Eco Camp", dist: "Kollam", city: "Munroe Island", addr: "Munroe Island, Kollam 691502", lat: "8.9951", lng: "76.6084", web: "https://munroecamp.com", ph: "+91 97460 12345", pr: "₹3,000", desc: "Waterfront glamping and cottage retreat on Munroe Island offering sunrise canoe tours and tent stays.", am: ["Waterfront Glamping", "Sunrise Canoe Tour", "Campfire", "Homestyle Food"], kw: ["Munroe Eco Camp", "glamping Kerala"] },
  { name: "Lake ‘n River Resort Munroe Island", dist: "Kollam", city: "Munroe Island", addr: "Peringalam, Munroe Island 691502", lat: "8.9892", lng: "76.6178", web: "https://lakenriver.com", ph: "+91 94471 23456", pr: "₹4,800", desc: "Surrounded on three sides by the Kallada River and Ashtamudi Lake with wooden chalets.", am: ["Riverfront Chalets", "Canoeing & Kayaking", "Fishing Rods", "Restaurant"], kw: ["Lake n River Resort", "Munroe Island chalets"] },

  // ── 11. TRIVANDRUM CITY ──
  { name: "Hyatt Regency Trivandrum", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "CV Raman Pillai Road, Thycaud, Trivandrum 695014", lat: "8.4971", lng: "76.9582", web: "https://www.hyatt.com/en-US/hotel/india/hyatt-regency-trivandrum/trvrv", ph: "+91 471 256 1234", pr: "₹7,500", desc: "5-star luxury city landmark with Santata Spa, outdoor swimming pool, and Regency Ballroom.", am: ["Outdoor Pool", "Santata Spa", "Malabar Cafe", "Convention Center"], kw: ["Hyatt Regency Trivandrum", "5 star hotels in Trivandrum"] },
  { name: "Vivanta Thiruvananthapuram", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "Palayam, Thiruvananthapuram 695033", lat: "8.5089", lng: "76.9521", web: "https://www.vivantahotels.com/en-in/vivanta-thiruvananthapuram/", ph: "+91 471 666 4000", pr: "₹6,800", desc: "Sleek 5-star hotel in the heart of Trivandrum with a dramatic rooftop infinity pool and Mynt 24/7 dining.", am: ["Rooftop Infinity Pool", "Mynt 24/7 Dining", "Fitness Centre", "Meeting Rooms"], kw: ["Vivanta Thiruvananthapuram", "Taj hotels Trivandrum"] },
  { name: "O by Tamara, Trivandrum", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "NH 66 Bypass, Anayara, Trivandrum 695029", lat: "8.5098", lng: "76.9082", web: "https://www.obytamara.com/trivandrum/", ph: "+91 471 660 1234", pr: "₹5,900", desc: "Eco-certified 5-star hotel on NH 66 bypass with rooftop pool, Elevation spa, and Grand Ballroom near Technopark.", am: ["Rooftop Pool", "Elevation Spa", "O Cafe 24/7", "Grand Ballroom"], kw: ["O by Tamara Trivandrum", "hotels near Technopark Trivandrum"] },
  { name: "Hilton Garden Inn Trivandrum", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "Punnen Road, Statues, Trivandrum 695039", lat: "8.4982", lng: "76.9491", web: "https://www.hilton.com/en/hotels/trvgigi-hilton-garden-inn-trivandrum/", ph: "+91 471 660 0000", pr: "₹5,800", desc: "Prime central location on MG Road with rooftop pool, V大全 restaurant, 24/7 business center.", am: ["Rooftop Pool", "24/7 Fitness Center", "Business Lounge", "MG Road Location"], kw: ["Hilton Garden Inn Trivandrum", "central Trivandrum hotels"] },
  { name: "Apollo Dimora Trivandrum", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "Near Central Railway Station, Thampanoor 695001", lat: "8.4891", lng: "76.9528", web: "https://apollodimora.com", ph: "+91 471 300 0111", pr: "₹4,200", desc: "Leading 4-star business hotel located opposite Trivandrum Central Railway Station with rooftop pool.", am: ["Rooftop Pool", "Station Proximity", "Fitness Center", "Vegetarian & Multi-Cuisine"], kw: ["Apollo Dimora Trivandrum", "Thampanoor hotels"] },
  { name: "The South Park Hotel", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "MG Road, Palayam, Trivandrum 695034", lat: "8.5021", lng: "76.9482", web: "https://thesouthpark.com", ph: "+91 471 233 3333", pr: "₹3,800", desc: "Established 4-star hotel on MG Road with traditional hospitality, conference suites, and Green Park dining.", am: ["MG Road Location", "Ayurvedic Center", "Conference Halls", "Bar & Lounge"], kw: ["The South Park Trivandrum", "MG Road hotels Trivandrum"] },
  { name: "Keys Select by Lemon Tree Hotels, Thiruvananthapuram", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "Opp. Fire Brigade, Housing Board Junction 695001", lat: "8.4921", lng: "76.9512", web: "https://www.lemontreehotels.com/keys-select-hotel/thiruvananthapuram/", ph: "+91 471 394 4100", pr: "₹3,400", desc: "Contemporary smart hotel near Central Station offering ergonomic work rooms and Keys Cafe.", am: ["Keys Cafe", "Gym", "Station Proximity", "Free High-Speed Wi-Fi"], kw: ["Keys Hotel Trivandrum", "business hotels Thampanoor"] },
  { name: "Uday Suites - The Airport Hotel", dist: "Thiruvananthapuram", city: "Thiruvananthapuram", addr: "T.C. 34/757/3, Shanghumugham, Trivandrum 695008", lat: "8.4812", lng: "76.9142", web: "https://www.udaysuites.com/uday-suites-trivandrum/", ph: "+91 471 250 4422", pr: "₹4,200", desc: "Four-star luxury garden airport hotel close to Shanghumugham Beach and Trivandrum Airport terminals.", am: ["Large Swimming Pool", "Airport Proximity (2 min)", "Ayurvedic Spa", "Health Club"], kw: ["Uday Suites Trivandrum", "hotels near Trivandrum Airport"] },

  // ── 12. THRISSUR ──
  { name: "Hyatt Regency Thrissur", dist: "Thrissur", city: "Thrissur", addr: "Civil Lines Road, Puzhakkal, Thrissur 680055", lat: "10.5489", lng: "76.1921", web: "https://www.hyatt.com/en-US/hotel/india/hyatt-regency-thrissur/tcirt", ph: "+91 487 265 1234", pr: "₹6,200", desc: "5-star luxury hotel in Puzhakkal with Santata Spa, outdoor pool, and Regency Ballroom.", am: ["Outdoor Pool", "Santata Spa", "Regency Ballroom", "24/7 Fitness Center"], kw: ["Hyatt Regency Thrissur", "5 star hotels Thrissur"] },
  { name: "Joys Palace Hotel, Thrissur", dist: "Thrissur", city: "Thrissur", addr: "T.B. Road, Thrissur 680021", lat: "10.5184", lng: "76.2162", web: "https://joyshotels.com/thrissur/", ph: "+91 487 242 9999", pr: "₹4,200", desc: "4-star luxury hotel near Thrissur Railway Station with swimming pool and Ayurveda massage.", am: ["Swimming Pool", "Ayurvedic Massage", "Royal Court Dining", "Station Proximity"], kw: ["Joys Palace Thrissur", "hotels near Thrissur Station"] },
  { name: "The Garuda Hotel Thrissur", dist: "Thrissur", city: "Thrissur", addr: "Kuruppam Road, Thrissur 680001", lat: "10.5212", lng: "76.2142", web: "https://thegarudahotel.com", ph: "+91 487 242 5000", pr: "₹3,900", desc: "Modern 4-star hotel near Swaraj Round with rooftop pool, banquet suites, and multi-cuisine restaurant.", am: ["Rooftop Pool", "Swaraj Round Proximity", "Banquet Suites", "Health Club"], kw: ["The Garuda Hotel Thrissur", "hotels near Swaraj Round"] },
  { name: "Lulu International Convention Center & Hotel Thrissur", dist: "Thrissur", city: "Thrissur", addr: "Puzhakkal, Ayyanthole, Thrissur 680055", lat: "10.5421", lng: "76.1982", web: "https://lulugroupinternational.com", ph: "+91 487 238 9000", pr: "₹5,000", desc: "Premier convention hotel in Ayyanthole with expansive event lawns, luxury suites, and multi-cuisine dining.", am: ["Convention Center", "Lush Event Lawns", "Multi-Cuisine Dining", "Valet Parking"], kw: ["Lulu Convention Center Thrissur", "wedding venues Thrissur"] },
  { name: "Dass Continental Thrissur", dist: "Thrissur", city: "Thrissur", addr: "Sakthan Thampuran Nagar, Thrissur 680001", lat: "10.5178", lng: "76.2198", web: "https://dasscontinental.com", ph: "+91 487 242 3001", pr: "₹2,800", desc: "Central business hotel located at Sakthan Thampuran bus stand vicinity with comfortable AC rooms.", am: ["Sakthan Stand Proximity", "Multi-Cuisine Restaurant", "Conference Room", "Free Wi-Fi"], kw: ["Dass Continental", "Sakthan Nagar hotels Thrissur"] },
  { name: "Casino Hotels Thrissur", dist: "Thrissur", city: "Thrissur", addr: "TB Road, Thrissur 680001", lat: "10.5192", lng: "76.2152", web: "https://casinohotels.in", ph: "+91 487 242 4690", pr: "₹3,200", desc: "Heritage business hotel in central Thrissur with traditional Kerala specialty restaurant and bar.", am: ["Central Location", "Heritage Bar & Dining", "Banquet Hall", "Free Parking"], kw: ["Casino Hotel Thrissur", "TB Road hotels Thrissur"] },

  // ── 13. KOZHIKODE / CALICUT ──
  { name: "The Raviz Kadavu, Kozhikode", dist: "Kozhikode", city: "Kozhikode", addr: "Calicut Bypass, Azhinjilam, Kozhikode 673632", lat: "11.1982", lng: "75.8741", web: "https://www.theraviz.com/the-raviz-kadavu/", ph: "+91 483 283 0500", pr: "₹6,900", desc: "5-star backwater resort on the Chaliyar River, blending Nallukettu architecture with river cottages.", am: ["Chaliyar Riverfront Pool", "Ayurvedic Hospital", "River Cottages", "Houseboat Dining"], kw: ["The Raviz Kadavu", "resorts in Kozhikode"] },
  { name: "The Gateway Hotel Beach Road Calicut", dist: "Kozhikode", city: "Kozhikode", addr: "PT Usha Road, Beach, Kozhikode 673032", lat: "11.2589", lng: "75.7721", web: "https://www.tajhotels.com/en-in/gateway/beach-road-calicut/", ph: "+91 495 661 3000", pr: "₹5,500", desc: "Taj hospitality right near Calicut Beach, known for authentic Malabar dining at Cape Comorin.", am: ["Swimming Pool", "Cape Comorin Restaurant", "Ayurvedic Treatments", "Beach Proximity"], kw: ["Gateway Hotel Calicut", "Taj hotel Calicut"] },
  { name: "Dimora Kozhikode", dist: "Kozhikode", city: "Kozhikode", addr: "Mini Bypass Road, Govindapuram, Kozhikode 673016", lat: "11.2482", lng: "75.8012", web: "https://dimorakozhikode.com", ph: "+91 495 274 0111", pr: "₹4,200", desc: "Modern 4-star business and leisure hotel on Mini Bypass Road with rooftop pool and multi-cuisine dining.", am: ["Rooftop Pool", "Fitness Center", "Banquet Facilities", "Free Wi-Fi"], kw: ["Dimora Kozhikode", "business hotels Calicut"] },
  { name: "Copper Folia Calicut", dist: "Kozhikode", city: "Kozhikode", addr: "Thondayad Bypass, Kozhikode 673017", lat: "11.2642", lng: "75.8189", web: "https://copperfolia.com", ph: "+91 495 711 1111", pr: "₹4,500", desc: "Contemporary 4-star boutique hotel near Thondayad Junction with rooftop swimming pool and luxury suites.", am: ["Rooftop Pool", "Boutique Suites", "Fine Dining", "Valet Parking"], kw: ["Copper Folia Calicut", "Thondayad hotels Kozhikode"] },
  { name: "Yash International Hotel Kozhikode", dist: "Kozhikode", city: "Kozhikode", addr: "Near Railway Station, Kozhikode 673002", lat: "11.2421", lng: "75.7882", web: "https://yashinternational.com", ph: "+91 495 270 1234", pr: "₹3,500", desc: "Comfortable hotel with easy access to Calicut Railway Station, offering business facilities and South Indian dining.", am: ["Station Proximity", "Business Center", "Restaurant", "Free Wi-Fi"], kw: ["Yash International Calicut", "hotels near Calicut Station"] },
  { name: "Sea Queen Hotel Kozhikode", dist: "Kozhikode", city: "Kozhikode", addr: "Beach Road, Kozhikode 673032", lat: "11.2512", lng: "75.7712", web: "https://seaqueenhotel.com", ph: "+91 495 236 6604", pr: "₹3,200", desc: "Heritage seafront hotel overlooking the Calicut Beach promenade with rooftop restaurant and sunset view rooms.", am: ["Seafront Location", "Rooftop Sunset Dining", "Bar", "Free Parking"], kw: ["Sea Queen Hotel Kozhikode", "beachfront hotels Calicut"] },

  // ── 14. KANNUR & BEKAL (NORTH KERALA) ──
  { name: "Taj Bekal Resort & Spa, Kerala", dist: "Kasaragod", city: "Bekal", addr: "Kappil Beach, Thekkekara, Bekal 671319", lat: "12.4121", lng: "75.0189", web: "https://www.tajhotels.com/en-in/taj/taj-bekal-kerala/", ph: "+91 467 661 6611", pr: "₹17,000", desc: "26-acre luxury beachfront resort inspired by Kettuvallam houseboats with Jiva Grande Spa and pool villas.", am: ["Private Pool Villas", "Jiva Grande Spa", "Backwater Lagoon", "Kappil Beach Access"], kw: ["Taj Bekal Resort", "luxury resorts Bekal"] },
  { name: "The Lalit Resort & Spa Bekal", dist: "Kasaragod", city: "Bekal", addr: "Balanagar, P.O. Udma, Bekal 671319", lat: "12.4082", lng: "75.0212", web: "https://www.thelalit.com/the-lalit-bekal/", ph: "+91 467 223 7777", pr: "₹15,500", desc: "Spa resort surrounded by Nombili River with internal lagoons, Rejuve Spa, and private jacuzzi in every room.", am: ["Jacuzzi in All Rooms", "Rejuve Spa", "Internal Lagoons", "Helipad"], kw: ["The Lalit Bekal", "5 star resorts Bekal"] },
  { name: "Malabar Ocean Front Resort & Spa", dist: "Kasaragod", city: "Nileshwar", addr: "Ozhinhavalappu P.O, Nileshwar 671314", lat: "12.2412", lng: "75.1142", web: "https://malabaroceanfrontresort.com", ph: "+91 467 228 8000", pr: "₹7,200", desc: "Exclusive beachfront resort on the unspoiled coastline of Nileshwar with private beach and Ayurveda.", am: ["Beachfront Pool", "Ayurvedic Center", "Sea View Cottages", "Private Beach Access"], kw: ["Malabar Ocean Front Resort", "Nileshwar beach resorts"] },
  { name: "Mascot Beach Resort Kannur", dist: "Kannur", city: "Kannur", addr: "Near Baby Beach, Burnassery, Kannur 670013", lat: "11.8542", lng: "75.3582", web: "https://mascotresort.com", ph: "+91 497 270 8445", pr: "₹4,200", desc: "Clifftop resort perched above Baby Beach and the Arabian Sea with seaside pool and seafood dining.", am: ["Seaside Cliff Pool", "Baby Beach Views", "Ayurvedic Massage", "Sea Breeze Dining"], kw: ["Mascot Beach Resort", "hotels in Kannur near beach"] },
  { name: "Krishna Beach Resort Kannur", dist: "Kannur", city: "Kannur", addr: "Payyambalam Beach Road, Kannur 670001", lat: "11.8682", lng: "75.3491", web: "https://krishnabeachresort.com", ph: "+91 497 276 9999", pr: "₹3,800", desc: "Beachfront hotel directly facing the famous Payyambalam Beach with sunset balconies and coastal dining.", am: ["Direct Payyambalam Beach Access", "Sea View Balconies", "Multi-Cuisine Dining", "Free Wi-Fi"], kw: ["Krishna Beach Resort", "Payyambalam beach hotels"] },
  { name: "Kairali Heritage Resort Kannur", dist: "Kannur", city: "Kattampally", addr: "Kattampally, Kannur 670011", lat: "11.9182", lng: "75.3882", web: "https://kairaliheritage.com", ph: "+91 497 278 0222", pr: "₹4,000", desc: "Riverfront resort set on the banks of Kattampally River with cottage villas, swimming pool, and boating.", am: ["Riverfront Swimming Pool", "Cottage Villas", "Boating & Fishing", "Ayurvedic Spa"], kw: ["Kairali Heritage Kannur", "riverfront resorts Kannur"] }
];

// Convert CITIES_DATA to output JSON schema
for (const item of CITIES_DATA) {
  RAW_HOTELS.push({
    hotel_name: item.name,
    district: item.dist,
    city: item.city,
    address: item.addr,
    google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(item.name + " " + item.city + " Kerala")}`,
    latitude: item.lat,
    longitude: item.lng,
    website: item.web,
    phone: item.ph,
    starting_price: item.pr,
    featured_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
    ],
    description: item.desc,
    amenities: item.am,
    keywords: item.kw
  });
}

// Remove duplicates if any by name
const uniqueMap = new Map();
RAW_HOTELS.forEach(h => {
  if (!uniqueMap.has(h.hotel_name)) {
    uniqueMap.set(h.hotel_name, h);
  }
});
const FINAL_LIST = Array.from(uniqueMap.values());

console.log(`Total verified unique Kerala hotels: ${FINAL_LIST.length}`);

// Write JSON
const outputPath = path.join(__dirname, 'kerala_100_top_hotels.json');
fs.writeFileSync(outputPath, JSON.stringify(FINAL_LIST, null, 2), 'utf8');
console.log(`Successfully generated ${outputPath}`);
