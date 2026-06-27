import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

export default async function handler(req, res) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch active hotels and their rooms from Supabase
    const { data: hotels, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, price, tax')
      .eq('status', 'active');

    if (hotelError) throw hotelError;

    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('id, hotel_id, type, price');

    if (roomError) throw roomError;

    const timestamp = new Date().toISOString();
    const transactionId = `TX-${Date.now()}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${timestamp}" id="${transactionId}">`;

    if (hotels && Array.isArray(hotels)) {
      hotels.forEach(h => {
        const hotelRooms = rooms ? rooms.filter(r => r.hotel_id === h.id) : [];
        
        xml += `
  <Result>
    <Property>${h.id}</Property>`;

        if (hotelRooms.length > 0) {
          hotelRooms.forEach(r => {
            const basePrice = r.price || h.price;
            const tax = Math.floor(basePrice * 0.18); // 18% standard GST if not defined
            xml += `
    <RoomBundle>
      <RoomID>${r.id}</RoomID>
      <Rate>
        <BaseRate currency="INR">${basePrice}</BaseRate>
        <Tax currency="INR">${tax}</Tax>
      </Rate>
    </RoomBundle>`;
          });
        } else {
          // Fallback to base hotel price if no room configurations are defined
          const basePrice = h.price || 1500;
          const tax = h.tax || Math.floor(basePrice * 0.18);
          xml += `
    <RoomBundle>
      <RoomID>default_room</RoomID>
      <Rate>
        <BaseRate currency="INR">${basePrice}</BaseRate>
        <Tax currency="INR">${tax}</Tax>
      </Rate>
    </RoomBundle>`;
        }

        xml += `
  </Result>`;
      });
    }

    xml += `
</Transaction>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=300');
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Google Hotels Pricing Feed error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
