import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

export default async function handler(req, res) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch active hotels from Supabase
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('id, name, location, whatsapp, created_at, status')
      .eq('status', 'active');

    if (error) throw error;

    const todayStr = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-kochi</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-kollam</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-varkala</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-munnar</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-thiruvananthapuram</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/budget-hotels-in-kerala</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.92</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-kerala</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.92</priority>
  </url>
  <!-- Programmatic Landmark & High-Intent Landing Pages -->
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-kochi-airport</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.92</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-lulu-mall</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-marine-drive</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-technopark-trivandrum</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-jatayu-earth-center</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-kollam-beach</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-munroe-island</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-wonderla-kochi</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-wayanad</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-kumarakom</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/houseboats-in-alleppey</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-thekkady</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-kovalam</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-vagamon</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/treehouse-resorts-in-kerala</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/ayurveda-resorts-in-kerala</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-kozhikode</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-in-thrissur</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/resorts-in-bekal</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotels-near-athirappilly-waterfalls</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/about</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/categories</loc>
    <lastmod>2026-06-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/list-your-hotel</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/contact</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/login</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/privacy</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/terms</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/cancellation</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

    function toSlug(name) {
      if (!name) return '';
      return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80);
    }

    // Read local 500+ hotels catalog for guaranteed 500+ indexing coverage
    let staticHotels = [];
    try {
      const fs = await import('fs');
      const path = await import('path');
      const jsonPath = path.join(process.cwd(), 'kerala_500_hotels.json');
      if (fs.existsSync(jsonPath)) {
        staticHotels = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }
    } catch(e) {
      console.warn("Could not read local kerala_500_hotels.json in sitemap:", e);
    }

    const hotelMap = new Map();
    if (Array.isArray(staticHotels)) {
      staticHotels.forEach(h => {
        const slug = h.slug || toSlug(h.name);
        hotelMap.set(slug, {
          name: h.name,
          location: h.location,
          slug: slug,
          whatsapp: h.whatsapp,
          created_at: todayStr
        });
      });
    }

    if (hotels && Array.isArray(hotels)) {
      hotels.forEach(h => {
        const slug = toSlug(h.name) || h.id;
        hotelMap.set(slug, {
          name: h.name,
          location: h.location,
          slug: slug,
          whatsapp: h.whatsapp,
          created_at: h.created_at || todayStr
        });
      });
    }

    // Add all 500+ hotels dynamically
    hotelMap.forEach(h => {
      const lastmod = h.created_at ? new Date(h.created_at).toISOString().split('T')[0] : todayStr;
      const hotelName = h.name || 'Unknown Hotel';
      const hotelPlace = h.location || 'Kerala';
      const slug = h.slug;
      let contactNum = String(h.whatsapp || 'N/A').replace(/\D/g, "");
      if (contactNum && contactNum !== "N/A" && contactNum !== "") {
        if (contactNum.length === 11 && contactNum.startsWith("0")) contactNum = contactNum.substring(1);
        if (contactNum.length === 10) contactNum = "91" + contactNum;
        contactNum = "+" + contactNum;
      } else {
        contactNum = "N/A";
      }
      
      xml += `
  <!-- Hotel: ${hotelName} | Place: ${hotelPlace} | Contact Number: ${contactNum} -->
  <url>
    <loc>https://www.hotelsnearmeinkerala.com/hotel/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
