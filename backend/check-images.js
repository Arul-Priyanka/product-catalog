const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const productsPath = path.join(__dirname, 'products.json');

if (!fs.existsSync(productsPath)) return console.error('products.json not found');
if (!fs.existsSync(imagesDir)) return console.error('images dir not found');

const files = fs.readdirSync(imagesDir).map(f => f.toLowerCase());
const products = JSON.parse(fs.readFileSync(productsPath,'utf8'));

console.log('Files in images folder:');
console.log(files.join('\n'));
console.log('\nProducts with missing images:');
let missing = 0;
products.forEach(p => {
  const img = (p.image||'').toLowerCase();
  const base = path.basename(img);
  if (!base || !files.includes(base)) {
    console.log(`- id:${p.id || '?'} name:${p.name || '?'} image field:${p.image}`);
    missing++;
  }
});
if (missing===0) console.log('All product image fields match files.');