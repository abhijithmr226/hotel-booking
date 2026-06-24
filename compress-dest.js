/**
 * Compress destination images in public/dest/
 * Run: node compress-dest.js
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, 'public', 'dest');

const files = fs.readdirSync(destDir);

(async () => {
  for (const file of files) {
    const fp = path.join(destDir, file);
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const buf = fs.readFileSync(fp);
    const origSize = buf.length;

    try {
      const outWebp = path.join(destDir, path.basename(file, ext) + '.webp');
      await sharp(buf)
        .resize(600, 400, { fit: 'cover', position: 'centre' })
        .webp({ quality: 72 })
        .toFile(outWebp);

      const newSize = fs.statSync(outWebp).size;
      const saved = Math.round((1 - newSize / origSize) * 100);
      console.log(`OK  ${file} → ${path.basename(outWebp)}  ${Math.round(origSize/1024)}KB → ${Math.round(newSize/1024)}KB  (${saved}% saved)`);

      // Remove the original non-webp if we converted it
      if (ext !== '.webp') {
        fs.unlinkSync(fp);
        console.log(`    Deleted original ${file}`);
      }
    } catch (e) {
      console.error(`FAIL ${file}: ${e.message}`);
    }
  }
  console.log('\nDone!');
})();
