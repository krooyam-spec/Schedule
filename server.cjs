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

// Serve static files from the 'dist' directory
app.use(express.static(STATIC_PATH, {
  maxAge: '1d',
  index: false // We handle the root / with res.sendFile for SPA support
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SiamSchedule Server is running' });
});

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // If it's a request for a static file (contains a dot) or an API route that wasn't caught, return 404
  if (req.url.includes('.') || req.url.startsWith('/api')) {
    return res.status(404).send('Resource not found');
  }
  
  const indexPath = path.join(STATIC_PATH, 'index.html');
  
  // Disable caching for index.html
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application index');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
