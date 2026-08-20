import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');

if (fs.existsSync(distDir)) {
  const hotelHtml = path.join(distDir, 'hotel.html');
  const hotelFolder = path.join(distDir, 'hotel');
  
  if (!fs.existsSync(hotelFolder)) {
    fs.mkdirSync(hotelFolder, { recursive: true });
  }

  if (fs.existsSync(hotelHtml)) {
    // Copy hotel.html to dist/hotel/index.html
    fs.copyFileSync(hotelHtml, path.join(hotelFolder, 'index.html'));
    console.log('Created dist/hotel/index.html fallback.');
  }

  // Create 404.html fallback to prevent hard 404s on SPA routing
  if (fs.existsSync(hotelHtml)) {
    fs.copyFileSync(hotelHtml, path.join(distDir, '404.html'));
    console.log('Created dist/404.html fallback from hotel.html.');
  }
}
