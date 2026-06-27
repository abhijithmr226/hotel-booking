const SUPABASE_URL = process.env.SUPABASE_URL || 'https://evtdifjlmutqmoowiggj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_YSWTprOUdQ3sDwXllOQm1g_DecbSLcB';

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Intercept requests for hotel details page (either /hotel.html or /hotel)
  if (path === '/hotel.html' || path === '/hotel') {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Pattern to catch social sharing preview bots
    const isBot = /facebookexternalhit|WhatsApp|Twitterbot|Pinterest|Google_Analytics|LinkedInBot|Slackbot|TelegramBot|Embedly/i.test(userAgent);
    
    if (isBot) {
      const hotelId = url.searchParams.get('id') || 'riverside';
      
      try {
        // Query Supabase directly using REST API for speed and Edge runtime support
        const res = await fetch(`${SUPABASE_URL}/rest/v1/hotels?id=eq.${hotelId}&select=name,description,location,image`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        });
        
        const data = await res.json();
        const hotel = data && data[0] ? data[0] : null;
        
        if (hotel) {
          const title = `${hotel.name} | Book stay in ${hotel.location || 'Kerala'}, India`;
          const rawDesc = hotel.description || '';
          const cleanDesc = rawDesc.replace(/<[^>]*>/g, '').substring(0, 160) + '...';
          const image = hotel.image ? (hotel.image.startsWith('http') ? hotel.image : `https://hotelsnearmeinkera.la${hotel.image.startsWith('/') ? '' : '/'}${hotel.image}`) : 'https://hotelsnearmeinkera.la/sharing-banner.jpg';
          
          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${cleanDesc}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url.href}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${cleanDesc}">
  <meta property="og:image" content="${image}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url.href}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${cleanDesc}">
  <meta name="twitter:image" content="${image}">
</head>
<body>
  <h1>${title}</h1>
  <p>${cleanDesc}</p>
</body>
</html>`;
          
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
          });
        }
      } catch (err) {
        console.error("Vercel Edge middleware crawler metadata fetch error:", err);
      }
    }
  }

  // Pass-through header tells Vercel router to continue serving the static files for normal users
  return new Response(null, {
    headers: {
      'x-middleware-next': '1'
    }
  });
}
