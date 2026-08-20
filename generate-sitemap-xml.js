import fs from 'fs';
import path from 'path';

function toSlug(name) {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const todayStr = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: 'https://www.hotelsnearmeinkerala.com/', priority: '1.0', changefreq: 'daily' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kochi', priority: '0.95', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kollam', priority: '0.95', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-varkala', priority: '0.95', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-munnar', priority: '0.95', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-thiruvananthapuram', priority: '0.95', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/budget-hotels-in-kerala', priority: '0.92', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-kerala', priority: '0.92', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-kochi-airport', priority: '0.92', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-lulu-mall', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-marine-drive', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-technopark-trivandrum', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-jatayu-earth-center', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-wonderla-kochi', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-athirappilly-waterfalls', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-bekal-fort', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-calicut-beach', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-guruvayur-temple', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-near-sabarimala', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kollam-beach', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-munroe-island', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-kumarakom', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/houseboats-in-alleppey', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-thekkady', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kovalam', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-wayanad', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-vagamon', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/treehouse-resorts-in-kerala', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/ayurveda-resorts-in-kerala', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kozhikode', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-thrissur', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/resorts-in-bekal', priority: '0.90', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-alappuzha', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kottayam', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-palakkad', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-malappuram', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kannur', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-kasaragod', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/hotels-in-pathanamthitta', priority: '0.88', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/categories.html', priority: '0.85', changefreq: 'weekly' },
  { url: 'https://www.hotelsnearmeinkerala.com/list-your-hotel.html', priority: '0.80', changefreq: 'monthly' },
  { url: 'https://www.hotelsnearmeinkerala.com/about.html', priority: '0.60', changefreq: 'monthly' },
  { url: 'https://www.hotelsnearmeinkerala.com/contact.html', priority: '0.60', changefreq: 'monthly' },
  { url: 'https://www.hotelsnearmeinkerala.com/privacy.html', priority: '0.30', changefreq: 'yearly' },
  { url: 'https://www.hotelsnearmeinkerala.com/terms.html', priority: '0.30', changefreq: 'yearly' },
  { url: 'https://www.hotelsnearmeinkerala.com/cancellation.html', priority: '0.30', changefreq: 'yearly' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

for (const p of staticPages) {
  xml += `  <url>
    <loc>${p.url}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>
`;
}

// Load 500+ hotels
const jsonPath = path.join(process.cwd(), 'kerala_500_hotels.json');
if (fs.existsSync(jsonPath)) {
  const hotels = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  for (const h of hotels) {
    const slug = h.slug || toSlug(h.name);
    const hotelName = escapeXml(h.name || 'Kerala Hotel');
    const hotelPlace = escapeXml(h.location || h.district || 'Kerala');
    
    let imageTag = '';
    if (h.image && typeof h.image === 'string') {
      const fullImg = h.image.startsWith('http') ? h.image : `https://www.hotelsnearmeinkerala.com${h.image.startsWith('/') ? '' : '/'}${h.image}`;
      imageTag = `
    <image:image>
      <image:loc>${escapeXml(fullImg)}</image:loc>
      <image:title>${hotelName}</image:title>
      <image:caption>${hotelName} in ${hotelPlace}, Kerala</image:caption>
    </image:image>`;
    }

    xml += `  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotel/${slug}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>${imageTag}
  </url>
`;
  }
}

xml += `</urlset>
`;

const publicSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(publicSitemapPath, xml, 'utf8');
console.log(`Successfully generated updated sitemap at ${publicSitemapPath}`);
