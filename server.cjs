const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

const STATIC_PATH = path.join(__dirname, 'dist');
const INDEX_HTML = path.join(STATIC_PATH, 'index.html');

// Serve static files from the 'dist' directory
app.use(express.static(STATIC_PATH));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SiamSchedule Server is running',
    version: '1.0.1',
    time: new Date().toISOString()
  });
});

// Since IIS (web.config) handles static files through the rewrite rule,
// we only need to handle the index.html fallback for SPA router paths.
app.get('*', (req, res) => {
  // Return 404 for missing API or static files
  if (req.url.startsWith('/api') || req.url.includes('.')) {
    return res.status(404).send('Not Found');
  }
  
  res.sendFile(INDEX_HTML, (err) => {
    if (err) {
      console.error('SPA Fallback Error:', err);
      res.status(500).send('Error loading application index');
    }
  });
});

// For IIS/iisnode, PORT is usually a string (Named Pipe)
app.listen(PORT, () => {
    console.log(`Server is now listening on provided channel: ${PORT}`);
});
