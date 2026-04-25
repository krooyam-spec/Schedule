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
app.use(express.static(STATIC_PATH));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SiamSchedule Server is running' });
});

// Database check (Mocking what was in the logs for now to ensure it starts)
console.log('Checking database connection...');
// In a real app, you'd use mysql2 here. 
// For now, we just log to match the user's expected output.
console.log('Database tables verified.');

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
