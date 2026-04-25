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
  // Use environment variables as preferred config
  const config = {
    host: process.env.DB_HOST || req.body.host,
    user: process.env.DB_USER || req.body.user,
    password: process.env.DB_PASSWORD || req.body.password,
    database: process.env.DB_NAME || req.body.database,
    port: parseInt(process.env.DB_PORT || req.body.port || '3306')
  };

  if (!config.host) {
    return res.status(400).json({ success: false, error: 'Database configuration (DB_HOST) is missing in environment variables' });
  }

  console.log(`Attempting MySQL schema update for ${config.database}@${config.host}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port
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
      `CREATE TABLE IF NOT EXISTS teacher_loads (
        id VARCHAR(50) PRIMARY KEY,
        teacherId VARCHAR(50),
        subjectCode VARCHAR(20),
        subjectName VARCHAR(100),
        level VARCHAR(50),
        room VARCHAR(50),
        hoursPerWeek INT,
        periodType VARCHAR(20)
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

app.get('/api/settings', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT data FROM settings WHERE id = "default"');
      if (rows.length > 0) return res.json(JSON.parse(rows[0].data));
    } catch (err) {
      console.error('MySQL Read settings error:', err);
    }
  }
  res.json(readData('settings', {}));
});

app.post('/api/settings', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const data = JSON.stringify(req.body);
      await p.query(
        'INSERT INTO settings (id, data) VALUES ("default", ?) ON DUPLICATE KEY UPDATE data = ?',
        [data, data]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Write settings error:', err);
    }
  }
  writeData('settings', req.body);
  res.json({ success: true });
});

// MySQL Connection Pool (Lazy initialization)
let pool;
function getPool() {
  if (!pool && process.env.DB_HOST) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

app.get('/api/subjects', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM subjects');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Read subjects error:', err);
    }
  }
  res.json(readData('subjects'));
});

app.post('/api/subjects', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const { id, code, name, category, hoursPerWeek } = req.body;
      await p.query(
        'INSERT INTO subjects (id, code, name, category, hoursPerWeek) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE code=?, name=?, category=?, hoursPerWeek=?',
        [id, code, name, category, hoursPerWeek, code, name, category, hoursPerWeek]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Write subjects error:', err);
    }
  }
  const items = readData('subjects');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('subjects', items);
  res.json({ success: true });
});

app.get('/api/teachers', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM teachers');
      return res.json(rows.map(r => ({ ...r, expertSubjects: JSON.parse(r.expertSubjects || '[]') })));
    } catch (err) {
      console.error('MySQL Read teachers error:', err);
    }
  }
  res.json(readData('teachers'));
});

app.post('/api/teachers', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const { id, name, expertSubjects, maxHoursPerWeek } = req.body;
      const subjectsJson = JSON.stringify(expertSubjects);
      await p.query(
        'INSERT INTO teachers (id, name, expertSubjects, maxHoursPerWeek) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, expertSubjects=?, maxHoursPerWeek=?',
        [id, name, subjectsJson, maxHoursPerWeek, name, subjectsJson, maxHoursPerWeek]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Write teachers error:', err);
    }
  }
  const items = readData('teachers');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('teachers', items);
  res.json({ success: true });
});

app.get('/api/classrooms', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM classrooms');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Read classrooms error:', err);
    }
  }
  res.json(readData('classrooms'));
});

app.post('/api/classrooms', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const { id, name, level } = req.body;
      await p.query(
        'INSERT INTO classrooms (id, name, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=?, level=?',
        [id, name, level, name, level]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Write classrooms error:', err);
    }
  }
  const items = readData('classrooms');
  const index = items.findIndex(i => i.id === req.body.id);
  if (index >= 0) items[index] = req.body;
  else items.push(req.body);
  writeData('classrooms', items);
  res.json({ success: true });
});

app.delete('/api/subjects/:id', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      await p.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Delete subjects error:', err);
    }
  }
  const items = readData('subjects');
  writeData('subjects', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.delete('/api/teachers/:id', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      await p.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Delete teachers error:', err);
    }
  }
  const items = readData('teachers');
  writeData('teachers', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.delete('/api/classrooms/:id', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      await p.query('DELETE FROM classrooms WHERE id = ?', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Delete classrooms error:', err);
    }
  }
  const items = readData('classrooms');
  writeData('classrooms', items.filter(i => i.id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/teacher-loads', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM teacher_loads');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Read teacher_loads error:', err);
    }
  }
  res.json(readData('teacher-loads'));
});

app.post('/api/teacher-loads', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const { id, teacherId, subjectCode, subjectName, level, room, hoursPerWeek, periodType } = req.body;
      await p.query(
        'INSERT INTO teacher_loads (id, teacherId, subjectCode, subjectName, level, room, hoursPerWeek, periodType) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE teacherId=?, subjectCode=?, subjectName=?, level=?, room=?, hoursPerWeek=?, periodType=?',
        [id, teacherId, subjectCode, subjectName, level, room, hoursPerWeek, periodType, teacherId, subjectCode, subjectName, level, room, hoursPerWeek, periodType]
      );
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Write teacher_loads error:', err);
    }
  }
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

app.delete('/api/teacher-loads/:id', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      await p.query('DELETE FROM teacher_loads WHERE id = ?', [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      console.error('MySQL Delete teacher_load error:', err);
    }
  }
  const items = readData('teacher-loads');
  const filtered = items.filter(i => i.id !== req.params.id);
  writeData('teacher-loads', filtered);
  res.json({ success: true });
});

app.post('/api/timetable/sync', async (req, res) => {
  const p = getPool();
  const entries = req.body;
  
  if (p) {
    let connection;
    try {
      connection = await p.getConnection();
      await connection.beginTransaction();
      
      // Clear existing records for the classrooms involved or just clear all
      await connection.query('DELETE FROM timetable');
      
      if (entries.length > 0) {
        const values = entries.map(e => [e.id, e.classroomId, e.subjectId, e.teacherId, e.day, e.period]);
        await connection.query(
          'INSERT INTO timetable (id, classroomId, subjectId, teacherId, day, period) VALUES ?',
          [values]
        );
      }
      
      await connection.commit();
      return res.json({ success: true });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error('MySQL Sync Timetable error:', err);
    } finally {
      if (connection) connection.release();
    }
  }
  
  writeData('timetable', entries);
  res.json({ success: true });
});

app.get('/api/timetable', async (req, res) => {
  const p = getPool();
  if (p) {
    try {
      const [rows] = await p.query('SELECT * FROM timetable');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Read timetable error:', err);
    }
  }
  res.json(readData('timetable'));
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
