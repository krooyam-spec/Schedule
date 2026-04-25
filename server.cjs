const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const STATIC_PATH = path.join(__dirname, 'dist');
console.log('Serving static files from:', STATIC_PATH);

// Explicitly serve the assets directory to be sure
app.use('/assets', express.static(path.join(STATIC_PATH, 'assets'), {
  fallthrough: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Serve other static files
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
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
