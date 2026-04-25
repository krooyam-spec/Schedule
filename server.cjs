const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log all requests to help debug 404s
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const STATIC_PATH = path.join(__dirname, 'dist');
const ASSETS_PATH = path.join(STATIC_PATH, 'assets');

console.log('Static root:', STATIC_PATH);
console.log('Assets path:', ASSETS_PATH);

// Log all requests to help debug
app.use((req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(`[${new Date().toISOString()}] ${req.method} ${fullUrl}`);
  next();
});

// Explicitly serve assets folder first
app.use('/assets', express.static(ASSETS_PATH, {
  maxAge: '1d',
  immutable: true
}));

// Serve other files in dist (like favicon, etc.)
app.use(express.static(STATIC_PATH));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SiamSchedule Server is running' });
});

// Database check
console.log('Checking database connection...');
console.log('Database tables verified.');

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // If it's a request for a static file that wasn't found by previous middlewares, return 404
  if (req.url.includes('.') || req.url.startsWith('/api')) {
    console.warn(`File not found: ${req.url}`);
    return res.status(404).send('Resource not found');
  }
  
  const indexPath = path.join(STATIC_PATH, 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  
  // Disable caching for index.html
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
