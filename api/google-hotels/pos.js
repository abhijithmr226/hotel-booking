export default function handler(req, res) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PointsOfSale>
  <PointOfSale id="HotelsNearMeInKerala">
    <PreferredIPRanges>
      <IPRange>0.0.0.0-255.255.255.255</IPRange>
    </PreferredIPRanges>
    <URL>https://hotelsnearmeinkera.la/hotel.html?id=[PROPERTY_ID]&amp;checkin=[CHECKIN]&amp;checkout=[CHECKOUT]</URL>
  </PointOfSale>
</PointsOfSale>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(xml);
}
