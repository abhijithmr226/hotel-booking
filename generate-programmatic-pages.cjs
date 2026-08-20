const fs = require('fs');
const path = require('path');

const LANDING_PAGES = [
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
    metaDescription: 'Top business hotels near Technopark Phase 1, 2, 3 & 4 (Kazhakkoottam, Thiruvananthapuram). High-speed Wi-Fi, conference facilities, and corporate tariff packages.',
    h1: 'Hotels Near Technopark Trivandrum',
    subtitle: 'Work-ready corporate hotels, extended-stay executive suites, and modern business properties in Kazhakkoottam & NH 66 corridor.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-technopark-trivandrum',
    district: 'Thiruvananthapuram',
    keyword: 'Technopark',
    filterCode: `h => h.district === 'Thiruvananthapuram'`,
    faqs: [
      { q: 'Are there extended stay and serviced apartments near Technopark?', a: 'Yes, Kazhakkoottam and Kulathoor have multiple executive suites and business hotels with workstations and laundry.' },
      { q: 'How far is Trivandrum Airport from Technopark?', a: 'Trivandrum International Airport (TRV) is approximately 11 km (15-20 min drive) from Technopark via NH 66.' }
    ],
    chips: ['Kazhakkoottam', 'Kovalam Beach', 'Trivandrum City', 'Varkala Cliff', 'Shangumugham']
  },
  {
    filename: 'hotels-near-jatayu-earth-center.html',
    slug: 'hotels-near-jatayu-earth-center',
    gridId: 'jatayu-hotels-grid',
    title: 'Hotels Near Jatayu Earth’s Center | Chadayamangalam & Kollam Stays',
    metaDescription: 'Find resorts and hotels near Jatayu Earth’s Center (Jatayu Nature Park, Chadayamangalam). Enjoy cable car rides, adventure games, and scenic hill resorts.',
    h1: 'Hotels Near Jatayu Earth’s Center',
    subtitle: 'Stay near the world’s largest bird sculpture in Chadayamangalam with scenic rock hill retreats and authentic Kerala hospitality.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-jatayu-earth-center',
    district: 'Kollam',
    keyword: 'Jatayu',
    filterCode: `h => h.district === 'Kollam' || h.district === 'Thiruvananthapuram'`,
    faqs: [
      { q: 'What is the best way to visit Jatayu Earth’s Center from Kollam or Trivandrum?', a: 'Jatayu Earth’s Center is located on MC Road (Chadayamangalam), roughly 38 km from Kollam city and 48 km from Trivandrum.' },
      { q: 'Is Jatayu Earth’s Center open on all days?', a: 'Yes, the center and ropeway operate daily from 10:00 AM to 6:00 PM.' }
    ],
    chips: ['Chadayamangalam', 'Kollam Beach', 'Ashtamudi Lake', 'Munroe Island', 'Thenmala Eco Tourism']
  },
  {
    filename: 'hotels-in-kollam-beach.html',
    slug: 'hotels-in-kollam-beach',
    gridId: 'kollam-beach-hotels-grid',
    title: 'Hotels in Kollam Beach | Seaside Resorts & Thangassery Stays',
    metaDescription: 'Book seaside hotels and resorts near Kollam Beach (Mahatma Gandhi Beach) and Thangassery Lighthouse. Ocean-view rooms, seafood dining, and sunset terraces.',
    h1: 'Hotels in Kollam Beach & Coastline',
    subtitle: 'Wake up to Arabian Sea breezes, golden sand beaches, and historic Thangassery Lighthouse views.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-in-kollam-beach',
    district: 'Kollam',
    keyword: 'Kollam Beach',
    filterCode: `h => h.district === 'Kollam'`,
    faqs: [
      { q: 'What are the top beach attractions in Kollam?', a: 'Kollam Beach (MG Park), Thangassery Lighthouse (1902), Thirumullavaram Beach, and the coastal park promenade.' },
      { q: 'Are beach resorts in Kollam less crowded than Kovalam or Varkala?', a: 'Yes! Kollam beaches are peaceful, unspoiled, and offer authentic local culture without heavy commercial tourist crowds.' }
    ],
    chips: ['Thangassery', 'Ashtamudi Lake', 'Munroe Island', 'Chavara', 'Paravur Lake']
  },
  {
    filename: 'resorts-in-munroe-island.html',
    slug: 'resorts-in-munroe-island',
    gridId: 'munroe-island-hotels-grid',
    title: 'Resorts & Homestays in Munroe Island | Backwater Village Stays',
    metaDescription: 'Experience serene backwater island life with canoe cruises, mangrove canal tours, and heritage homestays on Munroe Island (Mundrothuruthu), Kollam.',
    h1: 'Resorts & Homestays in Munroe Island',
    subtitle: 'Immerse yourself in Kerala’s most tranquil backwater archipelago with traditional canoe tours and authentic canal-side cottages.',
    canonical: 'https://www.hotelsnearmeinkerala.com/resorts-in-munroe-island',
    district: 'Kollam',
    keyword: 'Munroe Island',
    filterCode: `h => h.district === 'Kollam'`,
    faqs: [
      { q: 'What is the signature activity in Munroe Island?', a: 'The sunrise canoe boat tour through narrow canal waterways, mangrove arches, and coir retting villages.' },
      { q: 'How far is Munroe Island from Kollam Railway Station?', a: 'Munroe Island is approximately 25 km from Kollam Junction (about 40 minutes by road or scenic train ride).' }
    ],
    chips: ['Munroe Island', 'Ashtamudi Lake', 'Kollam City', 'Alappuzha Backwaters', 'Varkala Cliff']
  },
  {
    filename: 'hotels-near-wonderla-kochi.html',
    slug: 'hotels-near-wonderla-kochi',
    gridId: 'wonderla-hotels-grid',
    title: 'Hotels Near Wonderla Amusement Park Kochi | Family Stays Kakkanad',
    metaDescription: 'Find family-friendly hotels near Wonderla Kochi Amusement Park (Pallikkara, Kakkanad). Swimming pools, connecting rooms, and amusement park packages.',
    h1: 'Hotels Near Wonderla Kochi',
    subtitle: 'Plan the ultimate family amusement getaway with convenient stays near Wonderla Kochi and SmartCity Kakkanad.',
    canonical: 'https://www.hotelsnearmeinkerala.com/hotels-near-wonderla-kochi',
    district: 'Ernakulam',
    keyword: 'Wonderla',
    filterCode: `h => h.district === 'Ernakulam'`,
    faqs: [
      { q: 'Where is Wonderla Kochi located?', a: 'Wonderla is situated at Pallikkara near Kakkanad, about 15 km from Ernakulam city centre.' },
      { q: 'Are there resorts with pools near Wonderla Kochi?', a: 'Yes, Kakkanad and Infopark vicinity boast several 4-star resorts and hotels with pools and family suites.' }
    ],
    chips: ['Kakkanad', 'Infopark', 'Edappally', 'Aluva', 'Fort Kochi']
  }
];

function generateHtml(page) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hotelsnearmeinkerala.com/" },
      { "@type": "ListItem", "position": 2, "name": `Hotels in ${page.district}`, "item": `https://www.hotelsnearmeinkerala.com/?district=${encodeURIComponent(page.district)}` },
      { "@type": "ListItem", "position": 3, "name": page.h1, "item": page.canonical }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/favicon.png">
  <title>${page.title}</title>
  <meta name="description" content="${page.metaDescription}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${page.canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.metaDescription}">
  <meta property="og:image" content="https://www.hotelsnearmeinkerala.com/dest/${page.district.toLowerCase() === 'idukki' ? 'munnar' : page.district.toLowerCase() === 'ernakulam' ? 'kochi' : page.district.toLowerCase()}.webp">
  <meta property="og:url" content="${page.canonical}">
  <meta property="og:site_name" content="HotelsNearMeInKerala.com">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.metaDescription}">
  <meta name="twitter:image" content="https://www.hotelsnearmeinkerala.com/dest/${page.district.toLowerCase() === 'idukki' ? 'munnar' : page.district.toLowerCase() === 'ernakulam' ? 'kochi' : page.district.toLowerCase()}.webp">

  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-30NNKW9MXH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-30NNKW9MXH', { page_title: document.title, page_location: window.location.href });
  </script>

  <!-- Structured Data: BreadcrumbList -->
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbsSchema, null, 2)}
  </script>

  <!-- Structured Data: FAQPage -->
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>

  <!-- Preconnect & Styles -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" onload="this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap"></noscript>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
  <link rel="stylesheet" href="/src/style.css?v=3">
</head>

<body>
  <!-- Header -->
  <header>
    <div class="container">
      <a href="/index.html" class="logo" aria-label="HotelsNearMeInKerala.com – Home">
        <img src="/logo.webp" alt="HotelsNearMeInKerala.com" width="160" height="76">
      </a>
      <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
        <i class="fas fa-bars"></i>
      </button>
      <nav id="main-nav" aria-label="Main Navigation">
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
          <li class="active"><a href="${page.canonical}"><i class="fas fa-map-marker-alt"></i> ${page.keyword}</a></li>
          <li><a href="/categories.html"><i class="fas fa-th-large"></i> Categories</a></li>
        </ul>
      </nav>
      <div class="nav-backdrop" onclick="document.getElementById('mobile-menu-btn').click()"></div>
      <div class="header-right" id="header-user-menu">
        <a href="/login.html" class="btn btn-outline btn-sm" style="border-radius:30px; padding:8px 18px; font-size:13px;">Sign In</a>
        <a href="/login.html#register" class="btn btn-primary btn-sm" style="border-radius:30px; padding:8px 18px; font-size:13px;">Register</a>
      </div>
    </div>
  </header>

  <main id="main-content">
    <!-- Breadcrumb -->
    <div class="breadcrumb-container" style="background:#fff; border-bottom:1px solid var(--border); padding:10px 0;">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb" style="font-size:12.5px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <a href="/index.html" style="color:var(--text-secondary); text-decoration:none;"><i class="fas fa-home"></i> Home</a>
          <span style="color:var(--border);">/</span>
          <a href="/?district=${encodeURIComponent(page.district)}" style="color:var(--text-secondary); text-decoration:none;">Hotels in ${page.district}</a>
          <span style="color:var(--border);">/</span>
          <span style="color:var(--primary); font-weight:600;">${page.keyword}</span>
        </nav>
      </div>
    </div>

    <!-- Hero Section -->
    <section style="background: linear-gradient(135deg, #0d2b22 0%, #1a4a38 100%); color:#fff; padding: 48px 0 36px; text-align:center;">
      <div class="container">
        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.15); padding:4px 14px; border-radius:30px; font-size:12px; font-weight:700; margin-bottom:14px;">
          <i class="fas fa-compass" style="color:#25D366;"></i> Kerala Local Landmark Guide
        </div>
        <h1 style="font-size: clamp(24px, 4vw, 36px); font-weight:800; font-family:'Outfit', sans-serif; margin-bottom:12px; line-height:1.2;">
          ${page.h1}
        </h1>
        <p style="font-size: 15px; color:rgba(255,255,255,0.85); max-width: 680px; margin: 0 auto 24px; line-height:1.6;">
          ${page.subtitle}
        </p>

        <!-- Search input -->
        <div style="max-width:560px; margin:0 auto;">
          <form id="search-form" onsubmit="event.preventDefault(); window.location.href='/?q=' + encodeURIComponent(document.getElementById('page-search-input').value);">
            <div style="display:flex; background:#fff; border-radius:40px; padding:4px 4px 4px 18px; box-shadow:0 4px 20px rgba(0,0,0,0.2); align-items:center; gap:8px;">
              <i class="fas fa-search" style="color:var(--primary);"></i>
              <input type="text" id="page-search-input" placeholder="Search stays near ${page.keyword}..." style="flex:1; border:none; outline:none; font-size:14px; color:var(--text-main);" value="${page.keyword}">
              <button type="submit" class="btn btn-primary" style="border-radius:30px; padding:10px 22px; font-weight:700; font-size:13px;">Find Stays</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Landmark Nearby Chips -->
    <section style="background:#fff; border-bottom:1px solid var(--border); padding:16px 0;">
      <div class="container">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span style="font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Nearby Hubs:</span>
          ${page.chips.map(c => `<a href="/?q=${encodeURIComponent(c)}" class="quick-category-chip" style="font-size:12px; padding:4px 12px; border-radius:20px; text-decoration:none;">${c}</a>`).join('\n          ')}
        </div>
      </div>
    </section>

    <!-- Verified Hotels Grid -->
    <section style="background:#FAF9F6; padding: 48px 0;">
      <div class="container">
        <div class="section-header" style="margin-bottom:24px;">
          <div>
            <h2 style="font-size: 22px; font-weight:700; font-family:'Outfit', sans-serif;">Recommended Stays Near ${page.keyword}</h2>
            <p style="color:var(--text-secondary); font-size:14px;">Direct booking with WhatsApp confirmation & zero booking fees</p>
          </div>
        </div>

        <div class="grid hotels-grid" id="${page.gridId}">
          <div style="grid-column: span 3; text-align:center; padding:40px; color:var(--text-secondary);">
            <i class="fas fa-spinner fa-spin" style="font-size:32px; color:var(--primary); margin-bottom:12px;"></i>
            <p>Loading verified stays...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQs -->
    <section style="background:#fff; border-top:1px solid var(--border); padding: 56px 0;">
      <div class="container" style="max-width:800px;">
        <h2 style="font-size: 22px; font-weight:700; margin-bottom:6px; font-family:'Outfit', sans-serif;">Frequently Asked Questions</h2>
        <p style="color:var(--text-secondary); margin-bottom:24px; font-size:14px;">Everything you need to know about staying near ${page.keyword}</p>
        
        <div class="faq-list">
          ${page.faqs.map(f => `
            <div class="faq-item" style="border:1px solid var(--border); border-radius:12px; margin-bottom:12px; padding:16px 20px;">
              <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0 0 8px;">${f.q}</h3>
              <p style="font-size:13.5px; color:var(--text-secondary); margin:0; line-height:1.6;">${f.a}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Internal Link Clusters -->
    <section style="background:#F8FAFC; border-top:1px solid var(--border); padding:48px 0;">
      <div class="container">
        <h2 style="font-size: 18px; font-weight:700; margin-bottom:16px;">More Kerala Destinations to Explore</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;">
          <a href="/hotels-in-kochi" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-city" style="margin-right:8px;"></i>Hotels in Kochi</a>
          <a href="/hotels-in-munnar" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-mountain" style="margin-right:8px;"></i>Hotels in Munnar</a>
          <a href="/hotels-in-kollam" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-anchor" style="margin-right:8px;"></i>Hotels in Kollam</a>
          <a href="/hotels-in-varkala" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-umbrella-beach" style="margin-right:8px;"></i>Hotels in Varkala</a>
          <a href="/hotels-in-thiruvananthapuram" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-landmark" style="margin-right:8px;"></i>Hotels in Trivandrum</a>
          <a href="/budget-hotels-in-kerala" style="padding:12px 16px; border:1px solid var(--border); border-radius:10px; font-weight:600; color:var(--primary); text-decoration:none; background:#fff;"><i class="fas fa-wallet" style="margin-right:8px;"></i>Budget Hotels in Kerala</a>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-brand">
        <img src="/logo.webp" alt="HotelsNearMeInKerala.com" width="160" height="76" loading="lazy">
        <p>Your trusted Kerala-specialist travel platform with direct hotel booking, verified reviews, and local destination intelligence.</p>
      </div>
      <div>
        <h3>Top Destinations</h3>
        <ul>
          <li><a href="/hotels-in-kochi">Hotels in Kochi</a></li>
          <li><a href="/hotels-in-munnar">Hotels in Munnar</a></li>
          <li><a href="/hotels-in-kollam">Hotels in Kollam</a></li>
          <li><a href="/hotels-in-varkala">Hotels in Varkala</a></li>
          <li><a href="/hotels-in-thiruvananthapuram">Hotels in Trivandrum</a></li>
        </ul>
      </div>
      <div>
        <h3>Company</h3>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/contact.html">Contact Us</a></li>
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="/terms.html">Terms & Conditions</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 HotelsNearMeInKerala.com. All rights reserved.</p>
    </div>
  </footer>

  <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
    <a href="/index.html" class="mob-nav-item"><i class="fas fa-home"></i><span>Home</span></a>
    <a href="/?district=${encodeURIComponent(page.district)}" class="mob-nav-item active"><i class="fas fa-map-marker-alt"></i><span>${page.district}</span></a>
    <a href="/categories.html" class="mob-nav-item"><i class="fas fa-th-large"></i><span>Categories</span></a>
    <a href="/login.html" class="mob-nav-item"><i class="fas fa-user"></i><span>Account</span></a>
  </nav>

  <script type="module" src="/src/app.js"></script>
  <script type="module" src="/src/seo-enhancements.js"></script>
</body>
</html>`;
}

// Generate all pages
for (const page of LANDING_PAGES) {
  const filePath = path.join(__dirname, page.filename);
  fs.writeFileSync(filePath, generateHtml(page), 'utf8');
  console.log(`Created programmatic page: ${page.filename}`);
}

console.log('Finished generating programmatic landing pages.');
