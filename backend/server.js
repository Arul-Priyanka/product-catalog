
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Images directory and allowed extensions (include jpg/jpeg)
const imagesDir = path.join(__dirname, 'public', 'images');
const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created images directory: ${imagesDir}`);
}

// helper: try to find a file by basename with any allowed extension
function findFileByBase(base) {
  const baseName = path.basename(base, path.extname(base)).toLowerCase();
  const files = fs.readdirSync(imagesDir);
  const match = files.find(f => path.basename(f, path.extname(f)).toLowerCase() === baseName);
  return match || null;
}

// Route to serve images with safe filename handling and fallback placeholder
app.get('/images/:file', (req, res, next) => {
  try {
    const rawName = String(req.params.file || '');
    let filename = path.basename(rawName); // prevents path traversal
    let ext = path.extname(filename).toLowerCase();

    // if extension is provided but not allowed, reject
    if (ext && !allowedExts.includes(ext)) {
      console.log(`Invalid image type requested: ${filename}`);
      return res.status(400).send('Invalid image type');
    }

    // if file exists exactly, serve it
    let filePath = path.join(imagesDir, filename);
    if (!fs.existsSync(filePath)) {
      // try to find an alternate file with same basename (e.g. requests .png but actual is .jpg)
      const found = findFileByBase(filename);
      if (found) {
        filename = found;
        filePath = path.join(imagesDir, filename);
      }
    }

    if (fs.existsSync(filePath)) {
      console.log(`Serving image: ${filename}`);
      return res.sendFile(filePath, { headers: { 'Cache-Control': 'public, max-age=86400' } });
    }

    // fallback placeholder (create one if missing)
    let placeholder = path.join(imagesDir, 'placeholder.png');
    if (!fs.existsSync(placeholder)) {
      const svg = '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-size="16" fill="#999" text-anchor="middle" dy=".3em">No Image</text></svg>';
      fs.writeFileSync(placeholder, svg);
      console.log('Created placeholder.png');
    }

    console.log(`Serving placeholder for: ${req.params.file}`);
    return res.sendFile(placeholder, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch (err) {
    console.error(`Error serving image ${req.params.file}:`, err.message);
    next(err);
  }
});

// Keep express.static for other static needs
app.use('/images', express.static(imagesDir, { maxAge: '1d', index: false }));

// Load products.json
const productsPath = path.join(__dirname, 'products.json');
let products = [];
try {
  const raw = fs.readFileSync(productsPath, 'utf8');
  products = JSON.parse(raw);
  console.log(`Loaded ${products.length} products from products.json`);
} catch (err) {
  console.error('Error loading products.json:', err.message);
  products = [];
}

// Helpers
function isAbsoluteUrl(url) {
  return typeof url === 'string' && /^(?:[a-z]+:)?\/\//i.test(url);
}

function buildImageUrl(req, imageValue) {
  if (!imageValue) return null;
  if (isAbsoluteUrl(imageValue)) return imageValue;
  const filename = path.basename(String(imageValue));
  return `${req.protocol}://${req.get('host')}/images/${encodeURIComponent(filename)}`;
}

// API endpoints
app.get('/api/products', (req, res) => {
  try {
    const { type } = req.query;
    let list = products;

    if (type) {
      const filter = String(type).toLowerCase();
      list = list.filter(p => (p.type || '').toLowerCase() === filter);
    }

    const mapped = list.map(p => ({ ...p, image: buildImageUrl(req, p.image) }));
    console.log(`API /api/products: Returning ${mapped.length} products`);
    res.json(mapped);
  } catch (err) {
    console.error('Error in /api/products:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const prod = products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    res.json({ ...prod, image: buildImageUrl(req, prod.image) });
  } catch (err) {
    console.error('Error in /api/products/:id', err);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Images served from: ${imagesDir}`);
  console.log(`Test image URL: http://localhost:${port}/images/placeholder.png`);
});
