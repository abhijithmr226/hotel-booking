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
    <loc>https://hotelsnearmeinkera.la/</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/about.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/categories.html</loc>
    <lastmod>2026-06-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/contact.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/login.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/bookings.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/privacy.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/terms.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://hotelsnearmeinkera.la/cancellation.html</loc>
    <lastmod>2026-06-21</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Add hotels dynamically
    if (hotels && Array.isArray(hotels)) {
      hotels.forEach(h => {
        const lastmod = h.created_at ? new Date(h.created_at).toISOString().split('T')[0] : todayStr;
        const hotelName = h.name || 'Unknown Hotel';
        const hotelPlace = h.location || 'Kerala';
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
    <loc>https://hotelsnearmeinkera.la/hotel.html?id=${h.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      });
    }

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
