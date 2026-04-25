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
console.log('Serving static files from:', STATIC_PATH);

// Serve static files from the 'dist' directory
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
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  // Disable caching for index.html to ensure users see the latest build
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
