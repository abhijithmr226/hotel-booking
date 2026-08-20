const fs = require('fs');
const path = require('path');

const LANDING_PAGES = [
  // ── 1. Transit & Landmark Pages ──
  {
    filename: 'hotels-near-kochi-airport.html',
    slug: 'hotels-near-kochi-airport',
    gridId: 'kochi-airport-hotels-grid',
    title: 'Hotels Near Kochi Airport (CIAL) | Nedumbassery & Angamaly Stays',
    metaDescription: 'Find & book hotels near Cochin International Airport (CIAL) Nedumbassery. Free airport shuttles, 24/7 check-in, luxury transit hotels, and budget stays near Kochi airport.',
    h1: 'Hotels Near Kochi Airport (CIAL)',
    subtitle: 'Convenient transit stays, luxury airport resorts, and budget hotels within 5-15 minutes of Cochin International Airport (Nedumbassery).',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-kochi-airport',
    district: 'Ernakulam',
    keyword: 'Airport',
    filterCode: `h => h.district === 'Ernakulam' || h.location.toLowerCase().includes('nedumbassery') || h.location.toLowerCase().includes('kochi') || h.name.toLowerCase().includes('airport') || h.name.toLowerCase().includes('hyatt')`,
    faqs: [
      { q: 'How close are hotels to Cochin International Airport (CIAL)?', a: 'Many hotels are located within 1 km to 5 km of CIAL terminals in Nedumbassery, Nayathode, and Angamaly, offering 5-10 minute travel times.' },
      { q: 'Do hotels near Kochi Airport provide 24/7 check-in and free airport shuttles?', a: 'Yes, most airport hotels offer 24-hour front desks and can arrange airport transfers or pickup on request.' },
      { q: 'What is the average room price near Kochi Airport?', a: 'Budget rooms start around ₹1,400–₹2,500/night, while 4-star and 5-star transit resorts range from ₹4,500–₹9,000/night.' }
    ],
    chips: ['Nedumbassery', 'Angamaly', 'Aluva', 'Kochi City', 'Cherai Beach']
  },
  {
    filename: 'hotels-near-lulu-mall.html',
    slug: 'hotels-near-lulu-mall',
    gridId: 'lulu-mall-hotels-grid',
    title: 'Hotels Near Lulu Mall Kochi | Stays in Edappally & NH Bypass',
    metaDescription: 'Book top hotels near Lulu International Shopping Mall, Edappally, Kochi. Walking distance to Kochi Metro, shopping, dining, and NH Bypass. Best rates with direct booking.',
    h1: 'Hotels Near Lulu Mall, Edappally Kochi',
    subtitle: 'Stay steps away from India’s premier shopping destination with instant Kochi Metro connectivity and top dining hubs.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-lulu-mall',
    district: 'Ernakulam',
    keyword: 'Lulu Mall',
    filterCode: `h => h.district === 'Ernakulam'`,
    faqs: [
      { q: 'Which is the nearest Metro station to Lulu Mall Kochi?', a: 'Edappally Metro Station has direct skywalk connectivity directly into Lulu Mall Kochi.' },
      { q: 'Are there family-friendly hotels near Lulu Mall?', a: 'Yes, Edappally and Palarivattom feature premium business and family hotels with multi-cuisine dining and spacious suites.' }
    ],
    chips: ['Edappally', 'Palarivattom', 'Marine Drive', 'Kaloor', 'MG Road']
  },
  {
    filename: 'hotels-near-marine-drive.html',
    slug: 'hotels-near-marine-drive',
    gridId: 'marine-drive-hotels-grid',
    title: 'Hotels Near Marine Drive Kochi | Waterfront & Lake View Stays',
    metaDescription: 'Explore hotels near Marine Drive Kochi overlooking Vembanad Lake and the Arabian Sea. Luxury waterfront rooms, rooftop dining, and boat jetty proximity.',
    h1: 'Hotels Near Marine Drive Kochi',
    subtitle: 'Waterfront promenade stays, luxury lake-view suites, and central Ernakulam hotels overlooking Kochi backwaters.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-marine-drive',
    district: 'Ernakulam',
    keyword: 'Marine Drive',
    filterCode: `h => h.district === 'Ernakulam'`,
    faqs: [
      { q: 'Can I take sunset boat cruises from Marine Drive?', a: 'Yes, Marine Drive boat jetty operates regular Kerala State Water Transport Department ferries and private sunset backwater cruises.' },
      { q: 'How far is Fort Kochi from Marine Drive?', a: 'Fort Kochi is just a 20-minute scenic public boat ride across the harbor from Ernakulam Main Boat Jetty near Marine Drive.' }
    ],
    chips: ['Marine Drive', 'Fort Kochi', 'Willingdon Island', 'Mattancherry', 'Bolgatty Island']
  },
  {
    filename: 'hotels-near-technopark-trivandrum.html',
    slug: 'hotels-near-technopark-trivandrum',
    gridId: 'technopark-hotels-grid',
    title: 'Hotels Near Technopark Trivandrum | Kazhakkoottam Business Stays',
    metaDescription: 'Find hotels near Technopark Trivandrum in Kazhakkoottam. High-speed Wi-Fi, corporate rates, conference rooms, and close to NH 66 bypass corridor.',
    h1: 'Hotels Near Technopark, Trivandrum',
    subtitle: 'Executive business hotels, serviced apartments, and luxury stays around Technopark Phase 1, 2, 3 and Kazhakkoottam.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-technopark-trivandrum',
    district: 'Thiruvananthapuram',
    keyword: 'Technopark',
    filterCode: `h => h.district === 'Thiruvananthapuram'`,
    faqs: [
      { q: 'Are there long-stay options near Technopark Trivandrum?', a: 'Yes, multiple serviced apartments and business hotels in Kazhakkoottam offer weekly and monthly corporate booking packages.' },
      { q: 'How far is Trivandrum Airport from Technopark?', a: 'Trivandrum International Airport (TRV) is approximately 10–12 km away via NH 66 bypass (15–20 minutes drive).' }
    ],
    chips: ['Kazhakkoottam', 'NH 66 Bypass', 'Kovalam', 'Palayam', 'Thampanoor']
  },
  {
    filename: 'hotels-near-jatayu-earth-center.html',
    slug: 'hotels-near-jatayu-earth-center',
    gridId: 'jatayu-hotels-grid',
    title: 'Hotels Near Jatayu Earth Center Chadayamangalam | Kollam Stays',
    metaDescription: 'Book resorts & hotels near Jatayu Earth’s Center (Jatayu Rock) Chadayamangalam, Kollam. Cable car access, adventure park stays, and scenic nature resorts.',
    h1: 'Hotels Near Jatayu Earth’s Center',
    subtitle: 'Stay close to the world’s largest bird sculpture and adventure park at Chadayamangalam in Kollam district.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-jatayu-earth-center',
    district: 'Kollam',
    keyword: 'Jatayu',
    filterCode: `h => h.district === 'Kollam' || h.district === 'Thiruvananthapuram'`,
    faqs: [
      { q: 'What is the best time to visit Jatayu Earth Center?', a: 'Early morning or late afternoon (3:30 PM to 6:00 PM) offers the best weather for the cable car ride and panoramic sunset views.' },
      { q: 'Can I stay near Jatayu Rock and travel to Varkala Beach?', a: 'Yes, Varkala Cliff and Beach are only 28 km (45 minutes drive) from Chadayamangalam.' }
    ],
    chips: ['Chadayamangalam', 'Kollam City', 'Varkala Cliff', 'Ashtamudi Lake', 'Munroe Island']
  },
  {
    filename: 'hotels-in-kollam-beach.html',
    slug: 'hotels-in-kollam-beach',
    gridId: 'kollam-beach-hotels-grid',
    title: 'Hotels in Kollam Beach | Seaside Resorts & Ocean View Stays',
    metaDescription: 'Discover oceanfront hotels and beach resorts along Kollam Beach and Mahatma Gandhi Park. Sunset views, fresh seafood dining, and port town heritage.',
    h1: 'Hotels & Resorts in Kollam Beach',
    subtitle: 'Relax along the scenic coastline of southern Kerala with direct beach access and Arabian Sea breeze.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-kollam-beach',
    district: 'Kollam',
    keyword: 'Kollam Beach',
    filterCode: `h => h.district === 'Kollam'`,
    faqs: [
      { q: 'Are there beach resorts with swimming pools in Kollam?', a: 'Yes, several 4-star and 5-star beachfront and lake-confluence hotels feature infinity swimming pools and Ayurvedic spas.' }
    ],
    chips: ['Kollam Beach', 'Thangassery Lighthouse', 'Ashtamudi', 'Neendakara', 'Paravur']
  },
  {
    filename: 'resorts-in-munroe-island.html',
    slug: 'resorts-in-munroe-island',
    gridId: 'munroe-island-hotels-grid',
    title: 'Resorts in Munroe Island Kollam | Canoe Tours & Backwater Stays',
    metaDescription: 'Experience authentic Kerala backwater village life at Munroe Island resorts and homestays. Sunrise canoe tours, Kallada river cruises, and organic local meals.',
    h1: 'Resorts & Homestays in Munroe Island',
    subtitle: 'Cluster of 8 tranquil islands on Ashtamudi Lake famous for narrow canal canoe tours and lush mangrove water trails.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-munroe-island',
    district: 'Kollam',
    keyword: 'Munroe Island',
    filterCode: `h => h.district === 'Kollam'`,
    faqs: [
      { q: 'Why is Munroe Island famous in Kerala?', a: 'Munroe Island is renowned for its tranquil, narrow backwater canals where traditional hand-paddled canoes cruise through mangrove arches.' }
    ],
    chips: ['Munroe Island', 'Ashtamudi Lake', 'Kallada River', 'Kollam', 'Varkala']
  },
  {
    filename: 'hotels-near-wonderla-kochi.html',
    slug: 'hotels-near-wonderla-kochi',
    gridId: 'wonderla-hotels-grid',
    title: 'Hotels Near Wonderla Kochi | Family Resorts & Kakkanad Stays',
    metaDescription: 'Plan your amusement park holiday with hotels and family resorts near Wonderla Kochi (Pallikkara). Close to Infopark Kakkanad, theme park tickets, and pools.',
    h1: 'Hotels Near Wonderla Amusement Park Kochi',
    subtitle: 'Family-friendly hotels, water-park stays, and Kakkanad IT corridor accommodations near Wonderla Kochi.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-wonderla-kochi',
    district: 'Ernakulam',
    keyword: 'Wonderla',
    filterCode: `h => h.district === 'Ernakulam'`,
    faqs: [
      { q: 'How far is Kakkanad Infopark from Wonderla Kochi?', a: 'Wonderla Kochi in Pallikkara is just 6–8 km (12 minutes drive) from Kakkanad Infopark and SmartCity.' }
    ],
    chips: ['Pallikkara', 'Kakkanad Infopark', 'Edappally', 'Aluva', 'Kochi Airport']
  },

  // ── 2. NEW High-Intent Kerala Destination & Niche Pages ──
  {
    filename: 'hotels-in-wayanad.html',
    slug: 'hotels-in-wayanad',
    gridId: 'wayanad-hotels-grid',
    title: 'Best Resorts & Hotels in Wayanad | Rainforest & Tea Estate Stays',
    metaDescription: 'Book top-rated luxury resorts, jungle treehouses, and plantation stays in Wayanad. Private pool villas, Banasura lake views, Chembra Peak trekking, and Ayurvedic spas.',
    h1: 'Resorts & Hotels in Wayanad',
    subtitle: 'Misty rainforest retreats, private pool villas, and mountain plantation stays nestled in the Western Ghats of Wayanad.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-wayanad',
    district: 'Wayanad',
    keyword: 'Wayanad',
    filterCode: `h => h.district === 'Wayanad'`,
    faqs: [
      { q: 'Which are the best areas to stay in Wayanad?', a: 'Vythiri and Lakkidi are ideal for misty rainforests and luxury treehouses; Sultan Bathery and Kalpetta offer central connectivity; Padinjarathara overlooks the Banasura Sagar dam.' },
      { q: 'Are there resorts with private pool villas in Wayanad?', a: 'Yes, Wayanad features top luxury resorts like Mountain Shadows, Morickap, and Vythiri Resort with private plunge pools and jacuzzi suites.' }
    ],
    chips: ['Vythiri', 'Banasura Lake', 'Sultan Bathery', 'Kalpetta', 'Lakkidi', 'Meppadi']
  },
  {
    filename: 'resorts-in-kumarakom.html',
    slug: 'resorts-in-kumarakom',
    gridId: 'kumarakom-hotels-grid',
    title: 'Best Luxury Backwater Resorts in Kumarakom | Lake Vembanad',
    metaDescription: 'Explore 5-star backwater resorts and heritage pool villas in Kumarakom on Lake Vembanad. Sunset boat cruises, Kumarakom Bird Sanctuary stays, and authentic Ayurveda.',
    h1: 'Luxury Backwater Resorts in Kumarakom',
    subtitle: 'Stay on the tranquil shores of Lake Vembanad with meandering pool villas, traditional Tharavadu heritage, and private houseboats.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-kumarakom',
    district: 'Kottayam',
    keyword: 'Kumarakom',
    filterCode: `h => h.district === 'Kottayam' || h.name.toLowerCase().includes('kumarakom') || h.location.toLowerCase().includes('kumarakom')`,
    faqs: [
      { q: 'What is unique about Kumarakom backwater resorts?', a: 'Kumarakom resorts are built along the vast Vembanad Lake, featuring meandering swimming pools that connect directly to villa verandahs, heritage architecture, and direct bird sanctuary proximity.' },
      { q: 'Can I book houseboat day cruises from Kumarakom resorts?', a: 'Yes, all premier Kumarakom resorts have dedicated private boat jetties offering morning and sunset backwater cruises.' }
    ],
    chips: ['Lake Vembanad', 'Bird Sanctuary', 'Kottayam', 'Alleppey', 'Marari Beach']
  },
  {
    filename: 'houseboats-in-alleppey.html',
    slug: 'houseboats-in-alleppey',
    gridId: 'alleppey-houseboats-grid',
    title: 'Luxury Houseboat Cruises & Stays in Alleppey (Alappuzha) Backwaters',
    metaDescription: 'Book verified Kerala houseboats and backwater resorts in Alleppey (Alappuzha). 1 to 5 bedroom luxury AC houseboats, overnight cruises, and chef-prepared Kerala cuisine.',
    h1: 'Houseboats & Stays in Alleppey',
    subtitle: 'Glide through the legendary palm-fringed backwaters of Alappuzha aboard traditional thatched Kettuvallam houseboats.',
    canonical: 'https://www.hotelsnearmeinkerala.com/houseboats-in-alleppey',
    district: 'Alappuzha',
    keyword: 'Houseboat',
    filterCode: `h => h.district === 'Alappuzha' || h.category === 'Houseboats' || h.name.toLowerCase().includes('houseboat') || h.name.toLowerCase().includes('alleppey')`,
    faqs: [
      { q: 'How does an overnight houseboat stay in Alleppey work?', a: 'Check-in is typically at 12:00 PM with a welcome drink, followed by a scenic backwater cruise, traditional Kerala lunch, evening tea with snacks, sunset anchoring, dinner, and breakfast the next morning.' },
      { q: 'Are houseboats in Alleppey fully air-conditioned?', a: 'Yes, premium and luxury houseboats provide full-time or nighttime air conditioning with attached modern bathrooms and private viewing decks.' }
    ],
    chips: ['Punnamada Lake', 'Kainakary', 'Nedumudy', 'Vembanad Lake', 'Marari Beach']
  },
  {
    filename: 'resorts-in-thekkady.html',
    slug: 'resorts-in-thekkady',
    gridId: 'thekkady-hotels-grid',
    title: 'Best Resorts in Thekkady | Periyar Tiger Reserve & Wildlife Stays',
    metaDescription: 'Find luxury jungle resorts and spice plantation stays in Thekkady (Kumily). Jungle safaris in Periyar National Park, bamboo rafting, elephant camps, and spice gardens.',
    h1: 'Resorts & Hotels in Thekkady (Periyar)',
    subtitle: 'Jungle lodges, organic spice garden resorts, and wildlife sanctuaries at the gateway to Periyar Tiger Reserve.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-thekkady',
    district: 'Idukki',
    keyword: 'Thekkady',
    filterCode: `h => (h.district === 'Idukki' && (h.name.toLowerCase().includes('thekkady') || h.location.toLowerCase().includes('thekkady') || h.location.toLowerCase().includes('kumily'))) || h.name.toLowerCase().includes('elephant court') || h.name.toLowerCase().includes('spice village')`,
    faqs: [
      { q: 'Are there resorts inside the Periyar Tiger Reserve forest?', a: 'KTDC Aranya Nivas is situated inside the reserve perimeter, while premium eco-resorts like Spice Village and Elephant Court are located right at the sanctuary gate in Kumily.' }
    ],
    chips: ['Kumily', 'Periyar Tiger Reserve', 'Munnar', 'Vagamon', 'Ramakkalmedu']
  },
  {
    filename: 'hotels-in-kovalam.html',
    slug: 'hotels-in-kovalam',
    gridId: 'kovalam-hotels-grid',
    title: 'Best Beach Resorts in Kovalam | Clifftop & Ocean View Stays',
    metaDescription: 'Book top beach resorts and luxury hotels in Kovalam, Kerala. Clifftop infinity pools, Lighthouse Beach, Hawa Beach, private beaches, and certified Ayurveda wellness.',
    h1: 'Beach Resorts & Hotels in Kovalam',
    subtitle: 'Iconic rocky cliff resorts, sandy crescent beach retreats, and world-renowned Ayurveda sanctuaries in Kovalam.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-kovalam',
    district: 'Thiruvananthapuram',
    keyword: 'Kovalam',
    filterCode: `h => h.district === 'Thiruvananthapuram' && (h.name.toLowerCase().includes('kovalam') || h.location.toLowerCase().includes('kovalam') || h.name.toLowerCase().includes('leela') || h.name.toLowerCase().includes('samudra'))`,
    faqs: [
      { q: 'Which is the most popular beach in Kovalam?', a: 'Lighthouse Beach is the most famous for its striped lighthouse and beachfront restaurants, followed by Eve’s (Hawa) Beach and the quiet Samudra Beach.' }
    ],
    chips: ['Lighthouse Beach', 'Hawa Beach', 'Samudra Beach', 'Chowara', 'Trivandrum City']
  },
  {
    filename: 'resorts-in-vagamon.html',
    slug: 'resorts-in-vagamon',
    gridId: 'vagamon-hotels-grid',
    title: 'Best Resorts in Vagamon | Pine Forest & Misty Hill Stays',
    metaDescription: 'Discover scenic hilltop resorts and tea estate homestays in Vagamon, Kerala. Pine forests, green meadows, glass bridges, off-road safaris, and cool mountain air.',
    h1: 'Resorts & Stays in Vagamon Hills',
    subtitle: 'Offbeat hill station sanctuaries surrounded by rolling meadows, pine valleys, and mist-covered tea slopes.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-vagamon',
    district: 'Idukki',
    keyword: 'Vagamon',
    filterCode: `h => h.district === 'Idukki' && (h.name.toLowerCase().includes('vagamon') || h.location.toLowerCase().includes('vagamon'))`,
    faqs: [
      { q: 'What are the top attractions near Vagamon resorts?', a: 'Vagamon Pine Forest, Kurisumala Ashram, Vagamon Glass Bridge, Marmala Waterfalls, and Vagamon Lake.' }
    ],
    chips: ['Pine Forest', 'Kurisumala', 'Moonmala', 'Kolahalamedu', 'Elappara']
  },
  {
    filename: 'treehouse-resorts-in-kerala.html',
    slug: 'treehouse-resorts-in-kerala',
    gridId: 'treehouse-resorts-grid',
    title: 'Best Treehouse Resorts in Kerala | Wayanad, Munnar & Athirappilly',
    metaDescription: 'Experience staying in genuine wooden canopy treehouses in Kerala. High-elevation forest treehouses with modern luxury amenities in Wayanad, Munnar, and rainforest belts.',
    h1: 'Treehouse Resorts in Kerala',
    subtitle: 'Sleep high in the rainforest canopy surrounded by birdsong, cool mountain breezes, and panoramic valley views.',
    canonical: 'https://www.hotelsnearmeinkerala.com/treehouse-resorts-in-kerala',
    district: 'Kerala',
    keyword: 'Treehouse',
    filterCode: `h => h.category === 'Treehouse Stays' || h.name.toLowerCase().includes('tree') || h.name.toLowerCase().includes('vythiri') || h.name.toLowerCase().includes('wild') || h.amenities.some(a => a.toLowerCase().includes('tree'))`,
    faqs: [
      { q: 'Are treehouses in Kerala safe and equipped with electricity?', a: 'Yes, luxury treehouse resorts in Wayanad and Munnar are engineered with secure access, electricity, attached modern bathrooms, and hot water.' }
    ],
    chips: ['Wayanad', 'Munnar', 'Athirappilly', 'Thekkady', 'Silent Valley']
  },
  {
    filename: 'ayurveda-resorts-in-kerala.html',
    slug: 'ayurveda-resorts-in-kerala',
    gridId: 'ayurveda-resorts-grid',
    title: 'Top Authentic Ayurveda & Wellness Resorts in Kerala',
    metaDescription: 'Book certified Ayurveda retreats and wellness resorts in Kerala. Authentic Panchakarma treatments, daily yoga, Vaidya consultations, and organic satvik dining.',
    h1: 'Ayurveda & Wellness Resorts in Kerala',
    subtitle: 'Holistic rejuvenation in the birthplace of Ayurveda with certified doctors, herbal therapies, and beachside yoga.',
    canonical: 'https://www.hotelsnearmeinkerala.com/ayurveda-resorts-in-kerala',
    district: 'Kerala',
    keyword: 'Ayurveda',
    filterCode: `h => h.category === 'Ayurveda Resorts' || h.name.toLowerCase().includes('ayur') || h.name.toLowerCase().includes('retreat') || h.name.toLowerCase().includes('somatheeram') || h.amenities.some(a => a.toLowerCase().includes('ayurveda') || a.toLowerCase().includes('spa'))`,
    faqs: [
      { q: 'How long should an Ayurvedic Panchakarma program be in Kerala?', a: 'A full Panchakarma detoxification ideally requires 14 to 21 days, while rejuvenation and stress-management packages range from 7 to 10 days.' }
    ],
    chips: ['Kovalam', 'Chowara', 'Varkala', 'Kumarakom', 'Marari Beach']
  },
  {
    filename: 'hotels-in-kozhikode.html',
    slug: 'hotels-in-kozhikode',
    gridId: 'kozhikode-hotels-grid',
    title: 'Best Hotels in Kozhikode (Calicut) | Beach Road & Bypass Stays',
    metaDescription: 'Find top-rated luxury hotels, Chaliyar river resorts, and business stays in Kozhikode (Calicut). Proximity to Calicut Beach, authentic Malabar food, and airport connectivity.',
    h1: 'Hotels & Resorts in Kozhikode (Calicut)',
    subtitle: 'Experience world-famous Malabar hospitality, Chaliyar riverfront retreats, and coastal hotels in the historic spice port of Calicut.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-kozhikode',
    district: 'Kozhikode',
    keyword: 'Kozhikode',
    filterCode: `h => h.district === 'Kozhikode'`,
    faqs: [
      { q: 'Where are the best areas to stay in Kozhikode?', a: 'Beach Road is ideal for sea views and sunsets; Mavoor Road and SM Street are great for shopping and dining; NH Bypass and Azhinjilam offer luxury river resorts.' }
    ],
    chips: ['Calicut Beach', 'Chaliyar River', 'Mavoor Road', 'Thondayad Bypass', 'Kappad Beach']
  },
  {
    filename: 'hotels-in-thrissur.html',
    slug: 'hotels-in-thrissur',
    gridId: 'thrissur-hotels-grid',
    title: 'Best Hotels in Thrissur | Cultural Capital & Pooram Stays',
    metaDescription: 'Book top hotels and luxury accommodations in Thrissur, Kerala. Proximity to Vadakkumnathan Temple, Swaraj Round, Thrissur Railway Station, and Guruvayur.',
    h1: 'Hotels in Thrissur (Cultural Capital)',
    subtitle: 'Stay in the cultural heartland of Kerala close to historic temples, heritage festivals, and convention centers.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-thrissur',
    district: 'Thrissur',
    keyword: 'Thrissur',
    filterCode: `h => h.district === 'Thrissur'`,
    faqs: [
      { q: 'Which hotels in Thrissur are best for festival and Pooram visitors?', a: 'Hotels located around Swaraj Round, Kuruppam Road, and Puzhakkal offer easy access to the temple grounds and festival venues.' }
    ],
    chips: ['Swaraj Round', 'Puzhakkal', 'Guruvayur', 'Athirappilly', 'Sakthan Nagar']
  },
  {
    filename: 'resorts-in-bekal.html',
    slug: 'resorts-in-bekal',
    gridId: 'bekal-hotels-grid',
    title: 'Luxury Beach & Backwater Resorts in Bekal | Kasaragod',
    metaDescription: 'Discover premier 5-star beach and backwater resorts in Bekal, Kasaragod. Historic Bekal Fort views, private pool villas, Kappil Beach, and Jiva Grande spas.',
    h1: 'Luxury Resorts in Bekal, Kasaragod',
    subtitle: 'Secluded luxury along the untouched northern coast of Kerala featuring historic sea forts and backwater lagoons.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-bekal',
    district: 'Kasaragod',
    keyword: 'Bekal',
    filterCode: `h => h.district === 'Kasaragod' || h.name.toLowerCase().includes('bekal') || h.location.toLowerCase().includes('bekal')`,
    faqs: [
      { q: 'What is Bekal famous for?', a: 'Bekal is renowned for the 300-year-old keyhole-shaped Bekal Fort overlooking the Arabian Sea and its ultra-luxury beachfront resorts like Taj Bekal and The Lalit.' }
    ],
    chips: ['Bekal Fort', 'Kappil Beach', 'Nileshwar', 'Kasaragod', 'Kannur']
  },
  {
    filename: 'hotels-near-athirappilly-waterfalls.html',
    slug: 'hotels-near-athirappilly-waterfalls',
    gridId: 'athirappilly-hotels-grid',
    title: 'Hotels & Resorts Near Athirappilly Waterfalls | Chalakudy River Stays',
    metaDescription: 'Book scenic rainforest resorts and hotels near Athirappilly Waterfalls (the Niagara of India). Waterfall view rooms, Chalakudy riverfront, and Vazhachal forest stays.',
    h1: 'Hotels & Resorts Near Athirappilly Waterfalls',
    subtitle: 'Stay overlooking India’s most majestic waterfalls surrounded by lush Sholayar rainforests and riverfront trails.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-athirappilly-waterfalls',
    district: 'Thrissur',
    keyword: 'Athirappilly',
    filterCode: `h => h.district === 'Thrissur' || h.district === 'Ernakulam' || h.name.toLowerCase().includes('athirappilly') || h.location.toLowerCase().includes('athirappilly')`,
    faqs: [
      { q: 'Can you see Athirappilly Waterfalls directly from hotel rooms?', a: 'Yes, several boutique rainforest resorts offer private balconies and infinity pools facing the main waterfall cascade directly.' }
    ],
    chips: ['Athirappilly Falls', 'Vazhachal', 'Chalakudy River', 'Sholayar Forest', 'Thrissur']
  }
];

function generateHtml(page) {
  const faqSchemaItems = page.faqs.map(f => `
      {
        "@type": "Question",
        "name": "${f.q.replace(/"/g, '\\"')}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${f.a.replace(/"/g, '\\"')}"
        }
      }`).join(',');

  const chipsHtml = page.chips.map(c => `<span class="quick-category-chip">${c}</span>`).join('\n        ');

  const faqAccordionHtml = page.faqs.map((f, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
        <div class="faq-question">
          <span>${f.q}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          ${f.a}
        </div>
      </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <meta name="description" content="${page.metaDescription}">
  <meta name="keywords" content="${page.h1}, Hotels in ${page.district} Kerala, Book hotels ${page.keyword}, Kerala Tourism Stays, Best rates ${page.keyword}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${page.canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${page.canonical}">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.metaDescription}">
  <meta property="og:image" content="https://www.hotelsnearmeinkerala.com/og-banner.webp">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${page.canonical}">
  <meta property="twitter:title" content="${page.title}">
  <meta property="twitter:description" content="${page.metaDescription}">
  <meta property="twitter:image" content="https://www.hotelsnearmeinkerala.com/og-banner.webp">

  <!-- Favicon & Styles -->
  <link rel="icon" type="image/svg+xml" href="/vite.svg">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/src/style.css">

  <!-- JSON-LD Breadcrumbs -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hotelsnearmeinkerala.com/" },
      { "@type": "ListItem", "position": 2, "name": "${page.h1}", "item": "${page.canonical}" }
    ]
  }
  </script>

  <!-- JSON-LD FAQPage Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [${faqSchemaItems}
    ]
  }
  </script>

  <!-- JSON-LD LodgingBusiness Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "${page.h1}",
    "description": "${page.metaDescription.replace(/"/g, '\\"')}",
    "url": "${page.canonical}",
    "telephone": "+91 94479 08576",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Kerala",
      "addressCountry": "IN"
    },
    "priceRange": "₹₹ - ₹₹₹₹"
  }
  </script>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="container">
      <a href="/index.html" class="logo" aria-label="HotelsNearMeInKerala.com - Home">
        <img src="/logo.webp" alt="HotelsNearMeInKerala.com" width="220" height="104" fetchpriority="high">
      </a>
      <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open navigation menu">
        <i class="fas fa-bars"></i>
      </button>
      <nav id="main-nav">
        <div class="mobile-drawer-header">
          <img src="/logo.webp" alt="Logo" class="drawer-logo" width="160" height="76" loading="lazy">
          <span class="drawer-greeting">Welcome to Kerala!</span>
        </div>
        <div class="mobile-drawer-actions">
          <a href="/login.html" class="btn btn-outline btn-sm">Sign In</a>
          <a href="/login.html#register" class="btn btn-primary btn-sm">Register</a>
        </div>
        <ul>
          <li><a href="/index.html"><i class="fas fa-home"></i> Home</a></li>
          <li><a href="/index.html#hotels-near-you"><i class="fas fa-hotel"></i> Hotels</a></li>
          <li><a href="/categories.html"><i class="fas fa-th-large"></i> Categories</a></li>
          <li><a href="/resorts-in-kerala.html"><i class="fas fa-umbrella-beach"></i> Resorts</a></li>
          <li><a href="/list-your-hotel.html" style="color:var(--primary); font-weight:700;"><i class="fas fa-plus-circle"></i> List Hotel (Free)</a></li>
        </ul>
      </nav>
      <div class="nav-backdrop" onclick="document.getElementById('mobile-menu-btn').click()"></div>
      <div class="header-right">
        <a href="https://wa.me/919447908576?text=Hi%2C%20I%20want%20to%20list%20my%20hotel%20on%20HotelsNearMeInKerala" class="btn btn-outline btn-sm" target="_blank" rel="noopener" style="border-radius:30px; display:inline-flex; align-items:center; gap:6px;">
          <i class="fab fa-whatsapp" style="color:#25d366; font-size:14px;"></i> Partner Desk
        </a>
        <a href="/login.html" class="btn btn-primary btn-sm" style="border-radius:30px;">Sign In</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="destination-hero" style="background: linear-gradient(135deg, #09372d 0%, #108569 100%); color: #fff; padding: 60px 0 45px; text-align: center;">
    <div class="container">
      <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        📍 Kerala Local Search Guide
      </span>
      <h1 style="font-size: 2.5rem; font-weight: 800; margin: 16px 0 12px; color: #fff;">${page.h1}</h1>
      <p style="font-size: 1.1rem; max-width: 780px; margin: 0 auto 24px; opacity: 0.95; line-height: 1.6;">${page.subtitle}</p>

      <!-- Popular Local Tags -->
      <div class="hero-quick-categories" style="justify-content: center; margin-top: 15px;">
        ${chipsHtml}
      </div>
    </div>
  </section>

  <!-- Main Hotels Grid -->
  <main class="container" style="padding: 50px 20px;">
    <div class="section-header" style="margin-bottom: 30px;">
      <div>
        <h2>Verified Stays — Direct Booking at 0% Commission</h2>
        <p>Browse handpicked hotels with direct WhatsApp booking links and verified traveler reviews.</p>
      </div>
    </div>

    <!-- Dynamic Grid Mount -->
    <div class="grid hotels-grid" id="${page.gridId}">
      <!-- Hydrated dynamically from seo-enhancements.js -->
    </div>
  </main>

  <!-- FAQ Section -->
  <section style="background: #f8fafc; padding: 60px 0; border-top: 1px solid var(--border);">
    <div class="container" style="max-width: 800px;">
      <div class="section-header" style="text-align: center; margin-bottom: 30px;">
        <h2>Frequently Asked Questions</h2>
        <p>Helpful local insights for travelers staying around ${page.keyword}.</p>
      </div>
      <div class="faq-container">
        ${faqAccordionHtml}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-brand">
        <img src="/logo.webp" alt="HotelsNearMeInKerala.com" width="160" height="76" loading="lazy">
        <p>Your trusted travel partner for booking the best hotels, resorts, homestays and houseboats across the beautiful state of Kerala.</p>
        <div class="footer-socials">
          <a href="#" aria-label="Follow us on Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
          <a href="#" aria-label="Follow us on Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
          <a href="#" aria-label="Follow us on Twitter"><i class="fab fa-twitter" aria-hidden="true"></i></a>
          <a href="#" aria-label="Subscribe on YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
        </div>
      </div>

      <div>
        <h3>Top Destinations</h3>
        <ul>
          <li><a href="/hotels-in-kochi">Hotels in Kochi</a></li>
          <li><a href="/hotels-in-munnar">Hotels in Munnar</a></li>
          <li><a href="/hotels-in-wayanad">Resorts in Wayanad</a></li>
          <li><a href="/hotels-in-kollam">Hotels in Kollam</a></li>
          <li><a href="/hotels-in-varkala">Hotels in Varkala</a></li>
          <li><a href="/resorts-in-kumarakom">Resorts in Kumarakom</a></li>
        </ul>
      </div>

      <div>
        <h3>Top Categories</h3>
        <ul>
          <li><a href="/budget-hotels-in-kerala">Budget Hotels</a></li>
          <li><a href="/resorts-in-kerala">Resorts in Kerala</a></li>
          <li><a href="/houseboats-in-alleppey">Houseboats in Alleppey</a></li>
          <li><a href="/treehouse-resorts-in-kerala">Treehouse Resorts</a></li>
          <li><a href="/ayurveda-resorts-in-kerala">Ayurveda Wellness</a></li>
          <li><a href="/categories.html">All Categories</a></li>
        </ul>
      </div>

      <div>
        <h3>For Property Owners</h3>
        <ul>
          <li><a href="/list-your-hotel.html" style="color:var(--primary); font-weight:700;">🏨 List Property (Free)</a></li>
          <li><a href="/list-your-hotel.html#property-listing-form">Featured Partner Upgrade</a></li>
          <li><a href="https://wa.me/919447908576?text=Hi%2C%20I%20want%20to%20list%20my%20hotel%20in%20Kerala" target="_blank" rel="noopener">Partner WhatsApp Desk (+91 9447908576)</a></li>
          <li><a href="/terms.html">Partner Terms</a></li>
        </ul>
      </div>

      <div>
        <h3>Company</h3>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/contact.html">Contact Us</a></li>
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="/terms.html">Terms &amp; Conditions</a></li>
          <li><a href="/cancellation.html">Cancellation Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 HotelsNearMeInKerala.com. All rights reserved. Zero Commission Hotel Discovery.</p>
    </div>
  </footer>

  <script type="module" src="/src/seo-enhancements.js"></script>
</body>
</html>`;
}

// Generate all landing pages
LANDING_PAGES.forEach(page => {
  const filePath = path.join(__dirname, page.filename);
  fs.writeFileSync(filePath, generateHtml(page), 'utf8');
  console.log(`Generated SEO landing page: ${page.filename}`);
});

console.log(`Total programmatic SEO pages generated: ${LANDING_PAGES.length}`);
