import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

export default async function handler(req, res) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch active hotels from Supabase
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('id, name, location, district, whatsapp, image')
      .eq('status', 'active');

    if (error) throw error;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.gstatic.com/localfeed/local_feed.xsd">
  <language>en</language>`;

    if (hotels && Array.isArray(hotels)) {
      hotels.forEach(h => {
        let phone = String(h.whatsapp || "").replace(/\D/g, "");
        if (phone.length === 11 && phone.startsWith("0")) phone = phone.substring(1);
        if (phone.length === 10) phone = "91" + phone;
        if (phone !== "") phone = "+" + phone;

        xml += `
  <listing>
    <id>${h.id}</id>
    <name>${h.name}</name>
    <address format="simple">
      <component name="addr1">${h.location || 'Kerala'}</component>
      <component name="city">${h.district || 'Kerala'}</component>
      <component name="state">Kerala</component>
      <component name="country">IN</component>
    </address>
    <phone>${phone || '+919447908576'}</phone>
  </listing>`;
      });
    }

    xml += `
</listings>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Google Hotels List Feed error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
