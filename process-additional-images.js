import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hotelsDir = path.join(__dirname, 'public', 'assets', 'hotels');

const hotelImagesMap = [
  {
    id: 'hotel-coconut-lagoon',
    name: 'Coconut Lagoon CGH Earth, Kumarakom',
    mainUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', filename: 'room1.webp' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', filename: 'room2.webp' }
    ]
  },
  {
    id: 'hotel-fragrant-nature-munnar',
    name: 'Fragrant Nature Munnar',
    mainUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', filename: 'room1.webp' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', filename: 'room2.webp' }
    ]
  },
  {
    id: 'hotel-brunton-boatyard',
    name: 'Brunton Boatyard CGH Earth, Fort Kochi',
    mainUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', filename: 'room1.webp' },
      { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', filename: 'room2.webp' }
    ]
  },
  {
    id: 'hotel-elixir-hills',
    name: 'Elixir Hills Suites Resort, Munnar',
    mainUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', filename: 'room1.webp' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', filename: 'room2.webp' }
    ]
  },
  {
    id: 'hotel-niraamaya-kovalam',
    name: 'Niraamaya Retreats Surya Samudra, Kovalam',
    mainUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', filename: 'room1.webp' },
      { url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', filename: 'room2.webp' }
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
  console.log('🌅 Starting additional hotel images processing...');
  
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
  
  console.log('\n🎉 Additional hotel images processing completed!');
})();
