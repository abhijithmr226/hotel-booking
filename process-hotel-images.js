import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hotelsDir = path.join(__dirname, 'public', 'assets', 'hotels');

if (!fs.existsSync(hotelsDir)) {
  fs.mkdirSync(hotelsDir, { recursive: true });
}

const hotelImagesMap = [
  {
    id: 'hotel-grand-hyatt-kochi',
    name: 'Grand Hyatt Kochi Bolgatty',
    mainUrl: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHHpTIJjDJCTOJh_8hKPUS8Ws8TOxJ2nRvARgDW8GzfpGhU6IuQf0TbIN1G2acRL9tewrr9UmXm30mBOrxyX8J1jBDg6frxyQxWiLpZ6w8aDbQIiPWBNHtn6MRnoJogWoCnARme=w1000-h667',
    mainAlt: 'Grand Hyatt Kochi Bolgatty exterior luxury island resort on Vembanad Lake',
    rooms: [
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFXAlEH52yF1hgzvXVHNaehtzn0SdqSn0orQDcXxuzHRShSh2K2XZV6M-_WgQiqaqcgw6-RllWoakNywfjNbH_xspKgef6lS8XJj0lK6EK45mH0bdUG1sy8jcZfKkHQUB3Bk2B-qQ=w1000-h667',
        filename: 'room1.webp',
        alt: 'Grand Hyatt Kochi Bolgatty premium guest bedroom room view'
      },
      {
        url: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAElXqFc1fyaHG5IQZ40fCJZ35CY3gr9aby_ZKl3F21f_4pJrNY2vdgVFC79mHuSwYC7axYR1meC26uoNgrabOXyYNCzkmMmhhfPe_iXXee-rfHp2oBDEuETEI_sqbfU-96P2QhwHA=w1000-h667',
        filename: 'room2.webp',
        alt: 'Grand Hyatt Kochi Bolgatty grand bathroom suite with bathtub and luxury amenities'
      }
    ]
  },
  {
    id: 'hotel-crowne-plaza-kochi',
    name: 'Crowne Plaza Kochi',
    mainUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Crowne Plaza Kochi main pool and exterior building at Maradu Kundanoor Junction',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Crowne Plaza Kochi executive luxury room design'
      },
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Crowne Plaza Kochi guest suite bedroom and work desk'
      }
    ]
  },
  {
    id: 'hotel-taj-malabar-cochin',
    name: 'Taj Malabar Resort & Spa, Cochin',
    mainUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Taj Malabar Resort & Spa Cochin heritage resort exterior overlooking Arabian Sea',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Taj Malabar Resort & Spa Cochin heritage premium guest suite'
      },
      {
        url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Taj Malabar Resort & Spa Cochin dining by the waterfront with sunset views'
      }
    ]
  },
  {
    id: 'hotel-postcard-mandalay-hall',
    name: 'The Postcard Mandalay Hall',
    mainUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'The Postcard Mandalay Hall heritage courtyard luxury boutique hotel Fort Kochi',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'The Postcard Mandalay Hall art-centric luxury guest suite interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'The Postcard Mandalay Hall premium library and lobby area lounge'
      }
    ]
  },
  {
    id: 'hotel-gokulam-grand-kumarakom',
    name: 'Gokulam Grand Resort and Spa Kumarakom',
    mainUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Gokulam Grand Resort and Spa Kumarakom lakeside pool and resort grounds',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Gokulam Grand Resort and Spa Kumarakom premium lakeview suite bedroom'
      },
      {
        url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Gokulam Grand Resort and Spa Kumarakom tropical garden cottage exterior'
      }
    ]
  },
  {
    id: 'hotel-niraamaya-backwaters-kumarakom',
    name: 'Niraamaya Retreats Backwaters & Beyond',
    mainUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Niraamaya Retreats Backwaters & Beyond Kumarakom lush gardens and wellness paths',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Niraamaya Retreats Backwaters & Beyond luxury lake view cottage interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Niraamaya Retreats Backwaters & Beyond tranquil spa treatment room'
      }
    ]
  },
  {
    id: 'hotel-rhythm-kumarakom',
    name: 'Rhythm Kumarakom',
    mainUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Rhythm Kumarakom poolside cottages and backwater resort layout',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Rhythm Kumarakom lakeview terrace deluxe room interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Rhythm Kumarakom traditional boat jetty at sunset on Vembanad Lake'
      }
    ]
  },
  {
    id: 'hotel-taj-kumarakom',
    name: 'Taj Kumarakom Resort & Spa',
    mainUrl: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Taj Kumarakom Resort & Spa traditional heritage estate bungalow on Vembanad Lake',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Taj Kumarakom Resort & Spa lake view heritage cottage bedroom'
      },
      {
        url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Taj Kumarakom Resort & Spa private plunge pool villa patio'
      }
    ]
  },
  {
    id: 'hotel-uday-backwater-alappuzha',
    name: 'Uday Backwater Resort',
    mainUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    mainAlt: 'Uday Backwater Resort Punnamada lakefront layout with boats in Alappuzha',
    rooms: [
      {
        url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        filename: 'room1.webp',
        alt: 'Uday Backwater Resort lake view deluxe room interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        filename: 'room2.webp',
        alt: 'Uday Backwater Resort lakeside swimming pool and deck'
      }
    ]
  }
];

function download(url, filepath, retries = 3) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.destroy();
        fs.unlink(filepath, () => {});
        download(res.headers.location, filepath, retries - 1).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.destroy();
        fs.unlink(filepath, () => {});
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    });
    req.on('error', (e) => {
      file.destroy();
      fs.unlink(filepath, () => {});
      if (retries > 0) download(url, filepath, retries - 1).then(resolve).catch(reject);
      else reject(e);
    });
    req.setTimeout(15000, () => { req.destroy(); });
  });
}

async function processImage(srcPath, outPath, width, height, quality = 75) {
  await sharp(srcPath)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .webp({ quality })
    .toFile(outPath);
}

(async () => {
  console.log('🌅 Starting hotel images processing...');
  
  for (const item of hotelImagesMap) {
    const itemDir = path.join(hotelsDir, item.id);
    if (!fs.existsSync(itemDir)) {
      fs.mkdirSync(itemDir, { recursive: true });
    }
    
    const tempMainPath = path.join(itemDir, 'temp_main.jpg');
    const mainPath = path.join(itemDir, 'main.webp');
    const thumbPath = path.join(itemDir, 'thumb.webp');
    
    // Process Main & Thumbnail
    try {
      console.log(`\n🏨 [${item.name}] Downloading main image...`);
      await download(item.mainUrl, tempMainPath);
      
      console.log(`⚙️ Optimizing main.webp (800x600)...`);
      await processImage(tempMainPath, mainPath, 800, 600);
      
      console.log(`⚙️ Generating thumb.webp (300x225)...`);
      await processImage(tempMainPath, thumbPath, 300, 225);
      
      fs.unlinkSync(tempMainPath);
      console.log(`✅ Main and thumb completed.`);
    } catch (e) {
      console.error(`❌ Error main image for ${item.name}: ${e.message}`);
    }
    
    // Process Rooms
    for (const room of item.rooms) {
      const tempRoomPath = path.join(itemDir, `temp_${room.filename}`);
      const finalRoomPath = path.join(itemDir, room.filename);
      
      try {
        console.log(`  🛏️ Downloading room image (${room.filename})...`);
        await download(room.url, tempRoomPath);
        
        console.log(`  ⚙️ Optimizing ${room.filename} (600x400)...`);
        await processImage(tempRoomPath, finalRoomPath, 600, 400);
        
        fs.unlinkSync(tempRoomPath);
        console.log(`  ✅ ${room.filename} completed.`);
      } catch (e) {
        console.error(`  ❌ Error room image ${room.filename}: ${e.message}`);
      }
    }
  }
  
  console.log('\n🎉 Image processing completed!');
})();
