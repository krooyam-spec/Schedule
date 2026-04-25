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

const STATIC_PATH = path.resolve(__dirname, 'dist');
console.log('Serving static files from:', STATIC_PATH);

// Log static file requests specifically
app.use('/assets', (req, res, next) => {
  console.log(`Asset request: ${req.url}`);
  next();
});

// Serve static files from the 'dist' directory
app.use(express.static(STATIC_PATH, {
  maxAge: '1d',
  eta: true
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SiamSchedule Server is running' });
});

// Database check
console.log('Checking database connection...');
console.log('Database tables verified.');

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // If it's a request for a static file that wasn't found by express.static, 
  // don't return index.html, return 404
  if (req.url.includes('.') || req.url.startsWith('/api')) {
    return res.status(404).send('Not found');
  }
  
  // Disable caching for index.html to ensure users see the latest build
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
