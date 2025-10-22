// ...existing code...
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'products.json');
const backupPath = path.join(__dirname, 'products.json.bak');
const imagesDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(productsPath)) { console.error('products.json not found'); process.exit(1); }
if (!fs.existsSync(imagesDir))   { console.error('images dir not found'); process.exit(1); }

const raw = fs.readFileSync(productsPath, 'utf8');
let products;
try { products = JSON.parse(raw); } catch (e) { console.error('invalid JSON', e.message); process.exit(1); }

const files = fs.readdirSync(imagesDir).map(f => f.toLowerCase());

// normalize helper: basename without extension and remove separators
function normalizeName(s){
  return s ? path.basename(String(s)).toLowerCase().replace(/[_\s\-]+/g,'') : '';
}

// map normalized basename -> actual filename (first match)
const mapBaseToFile = {};
for (const f of files) {
  const key = normalizeName(f.replace(path.extname(f), ''));
  if (!mapBaseToFile[key]) mapBaseToFile[key] = f;
}

const report = [];
const fixed = products.map(p => {
  const orig = p.image || '';
  const origBase = normalizeName(orig);
  let chosen = null;

  // 1) exact filename match (case-insensitive)
  const exact = files.find(f => f === String(orig).toLowerCase());
  if (exact) chosen = exact;

  // 2) match by basename ignoring extension
  if (!chosen && origBase && mapBaseToFile[origBase]) chosen = mapBaseToFile[origBase];

  // 3) try matching by product name words
  if (!chosen && p.name) {
    const nameKey = normalizeName(p.name);
    // find file whose normalized basename contains the nameKey (or vice versa)
    chosen = files.find(f => {
      const k = normalizeName(f.replace(path.extname(f), ''));
      return k.includes(nameKey) || nameKey.includes(k);
    });
  }

  if (!chosen) {
    chosen = 'placeholder.png'; // ensure placeholder.png exists in imagesDir
    report.push({ id: p.id, name: p.name, before: orig, after: chosen, note: 'fallback' });
  } else {
    report.push({ id: p.id, name: p.name, before: orig, after: chosen });
  }

  return { ...p, image: chosen };
});

fs.copyFileSync(productsPath, backupPath);
fs.writeFileSync(productsPath, JSON.stringify(fixed, null, 2), 'utf8');
console.log(`Updated ${fixed.length} products. Backup at products.json.bak`);
console.table(report);
// ...existing code...