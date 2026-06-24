/**
 * Downloads all external destination + testimonial images to public/dest/
 * Run: node download-images.js
 */
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, 'public', 'dest');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const images = [
  { url: 'https://www.oyorooms.com/travel-guide/wp-content/uploads/2019/04/Fort-Kochi.webp', file: 'kochi.webp' },
  { url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=75', file: 'alappuzha.webp' },
  { url: 'https://deih43ym53wif.cloudfront.net/thiruvananthapuram-india-shutterstock_498424870_54ec620099.jpeg', file: 'trivandrum.jpg' },
  { url: 'https://thewoodsresorts.com/uploads/media/why-choose-wayanad-for-your-holidays620b99bd34f7c.jpeg', file: 'wayanad.jpg' },
  { url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/9c/f4/af/worlds-largest-bird-sculpture.jpg?w=600', file: 'kollam.jpg' },
  { url: 'https://thumbs.dreamstime.com/b/kottayam-scene-2897504.jpg', file: 'kottayam.jpg' },
  { url: 'https://www.holidify.com/images/bgImages/PALAKKAD.jpg', file: 'palakkad.jpg' },
  { url: 'https://keralatraveldiaryindia.wordpress.com/wp-content/uploads/2019/01/malappuram-kottakkunnu.jpg', file: 'malappuram.jpg' },
  { url: 'https://gokeralatour.travel.blog/wp-content/uploads/2020/01/paathanamthittaa.jpg', file: 'pathanamthitta.jpg' },
  { url: 'https://thegreenodyssey.in/wp-content/uploads/2022/06/kasaraGod.jpg', file: 'kasaragod.jpg' },
  { url: 'https://img.freepik.com/premium-photo/indian-smiling-man-wearing-orange-sweater-with-his-arms-crossed-white-background_862994-605651.jpg?w=200', file: 'testimonial1.jpg' },
  { url: 'https://img.freepik.com/premium-photo/indian-man-college-campus-with-beautiful-background_181020-1883.jpg?w=200', file: 'testimonial2.jpg' },
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

(async () => {
  for (const img of images) {
    const fp = path.join(destDir, img.file);
    if (fs.existsSync(fp) && fs.statSync(fp).size > 1000) {
      console.log(`SKIP  ${img.file} (already exists)`);
      continue;
    }
    try {
      await download(img.url, fp);
      const size = Math.round(fs.statSync(fp).size / 1024);
      console.log(`OK    ${img.file} (${size} KB)`);
    } catch (e) {
      console.error(`FAIL  ${img.file}: ${e.message}`);
    }
  }
  console.log('\nDone! Check public/dest/');
})();
