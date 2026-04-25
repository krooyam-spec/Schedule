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
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Warning: Could not create data directory. Persistence may fail:', err.message);
}

const getFilePath = (name) => path.join(DATA_DIR, `${name}.json`);

const readData = (name, defaultData = []) => {
  try {
    const filePath = getFilePath(name);
    if (!fs.existsSync(filePath)) return defaultData;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Read error (${name}):`, err.message);
    return defaultData;
  }
};

const writeData = (name, data) => {
  try {
    const filePath = getFilePath(name);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Write error (${name}):`, err.message);
    return false;
  }
};

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SiamSchedule Server is running',
    version: '1.0.1',
    time: new Date().toISOString()
  });
});

const mysql = require('mysql2/promise');

app.post('/api/db/update-schema', async (req, res) => {
  const config = req.body;
  if (!config || !config.host) {
    return res.status(400).json({ success: false, error: 'Database configuration is missing' });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port || 3306
    });

    // Create tables
    const queries = [
      `CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(20),
        name VARCHAR(100),
        category VARCHAR(100),
        hoursPerWeek INT
      )`,
      `CREATE TABLE IF NOT EXISTS teachers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        expertSubjects TEXT,
        maxHoursPerWeek INT
      )`,
      `CREATE TABLE IF NOT EXISTS classrooms (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(50),
        level VARCHAR(50)
      )`,
      `CREATE TABLE IF NOT EXISTS timetable (
        id VARCHAR(50) PRIMARY KEY,
        classroomId VARCHAR(50),
        subjectId VARCHAR(50),
        teacherId VARCHAR(50),
        day VARCHAR(20),
        period INT
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(10) PRIMARY KEY,
        data TEXT
      )`
    ];

    for (const q of queries) {
      await connection.query(q);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('MySQL Schema Update Error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.end();
  }
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

app.delete('/api/subjects/:id', (req, res) => {
  const items = readData('subjects');
  writeData('subjects', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.delete('/api/teachers/:id', (req, res) => {
  const items = readData('teachers');
  writeData('teachers', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.delete('/api/classrooms/:id', (req, res) => {
  const items = readData('classrooms');
  writeData('classrooms', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/teacher-loads', (req, res) => res.json(readData('teacher-loads')));
app.post('/api/teacher-loads', (req, res) => {
  const items = readData('teacher-loads');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  if (writeData('teacher-loads', items)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write data' });
  }
});
app.delete('/api/teacher-loads/:id', (req, res) => {
  const items = readData('teacher-loads');
  const filtered = items.filter(i => i.id !== req.params.id);
  writeData('teacher-loads', filtered);
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
