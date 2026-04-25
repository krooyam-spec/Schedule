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
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const getFilePath = (name) => path.join(DATA_DIR, `${name}.json`);
const readData = (name, defaultData = []) => {
  const filePath = getFilePath(name);
  if (!fs.existsSync(filePath)) return defaultData;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};
const writeData = (name, data) => {
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2));
};

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SiamSchedule Server is running',
    version: '1.0.1',
    time: new Date().toISOString()
  });
});

app.get('/api/settings', (req, res) => res.json(readData('settings', {})));
app.post('/api/settings', (req, res) => {
  writeData('settings', req.body);
  res.json({ success: true });
});

app.get('/api/subjects', (req, res) => res.json(readData('subjects')));
app.post('/api/subjects', (req, res) => {
  const items = readData('subjects');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('subjects', items);
  res.json({ success: true });
});

app.get('/api/teachers', (req, res) => res.json(readData('teachers')));
app.post('/api/teachers', (req, res) => {
  const items = readData('teachers');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('teachers', items);
  res.json({ success: true });
});

app.get('/api/classrooms', (req, res) => res.json(readData('classrooms')));
app.post('/api/classrooms', (req, res) => {
  const items = readData('classrooms');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('classrooms', items);
  res.json({ success: true });
});

app.get('/api/timetable', (req, res) => res.json(readData('timetable')));
app.post('/api/timetable/sync', (req, res) => {
  writeData('timetable', req.body);
  res.json({ success: true });
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
