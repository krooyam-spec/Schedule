import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import cors from 'cors';

const db = new Database('siam_schedule.db');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT,
    category TEXT,
    hoursPerWeek INTEGER
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    name TEXT,
    expertSubjects TEXT,
    maxHoursPerWeek INTEGER
  );

  CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    level TEXT
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id TEXT PRIMARY KEY,
    classroomId TEXT,
    subjectId TEXT,
    teacherId TEXT,
    day TEXT,
    period INTEGER
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/subjects', (req, res) => {
    const rows = db.prepare('SELECT * FROM subjects').all();
    res.json(rows);
  });

  app.post('/api/subjects', (req, res) => {
    const { id, code, name, category, hoursPerWeek } = req.body;
    db.prepare('INSERT OR REPLACE INTO subjects VALUES (?, ?, ?, ?, ?)').run(id, code, name, category, hoursPerWeek);
    res.sendStatus(200);
  });

  app.delete('/api/subjects/:id', (req, res) => {
    db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
  });

  app.get('/api/teachers', (req, res) => {
    const rows = db.prepare('SELECT * FROM teachers').all();
    const formatted = rows.map((r: any) => ({ ...r, expertSubjects: JSON.parse(r.expertSubjects || '[]') }));
    res.json(formatted);
  });

  app.post('/api/teachers', (req, res) => {
    const { id, name, expertSubjects, maxHoursPerWeek } = req.body;
    db.prepare('INSERT OR REPLACE INTO teachers VALUES (?, ?, ?, ?)').run(id, name, JSON.stringify(expertSubjects), maxHoursPerWeek);
    res.sendStatus(200);
  });

  app.delete('/api/teachers/:id', (req, res) => {
    db.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
  });

  app.get('/api/classrooms', (req, res) => {
    const rows = db.prepare('SELECT * FROM classrooms').all();
    res.json(rows);
  });

  app.post('/api/classrooms', (req, res) => {
    const { id, name, level } = req.body;
    db.prepare('INSERT OR REPLACE INTO classrooms VALUES (?, ?, ?)').run(id, name, level);
    res.sendStatus(200);
  });

  app.delete('/api/classrooms/:id', (req, res) => {
    db.prepare('DELETE FROM classrooms WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
  });

  app.get('/api/timetable', (req, res) => {
    const rows = db.prepare('SELECT * FROM timetable').all();
    res.json(rows);
  });

  app.post('/api/timetable/sync', (req, res) => {
    const entries = req.body;
    const deleteOld = db.prepare('DELETE FROM timetable');
    const insert = db.prepare('INSERT INTO timetable VALUES (?, ?, ?, ?, ?, ?)');
    
    const transaction = db.transaction((data) => {
      deleteOld.run();
      for (const entry of data) {
        insert.run(entry.id, entry.classroomId, entry.subjectId, entry.teacherId, entry.day, entry.period);
      }
    });

    transaction(entries);
    res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
