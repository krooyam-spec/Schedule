import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/subjects', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM subjects');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/subjects', async (req, res) => {
    const { id, code, name, category, hoursPerWeek } = req.body;
    try {
      await pool.query(
        'INSERT INTO subjects (id, code, name, category, hoursPerWeek) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE code=?, name=?, category=?, hoursPerWeek=?',
        [id, code, name, category, hoursPerWeek, code, name, category, hoursPerWeek]
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/subjects/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/teachers', async (req, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM teachers');
      const formatted = rows.map((r: any) => ({ ...r, expertSubjects: JSON.parse(r.expertSubjects || '[]') }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/teachers', async (req, res) => {
    const { id, name, expertSubjects, maxHoursPerWeek } = req.body;
    try {
      const subjectsJson = JSON.stringify(expertSubjects);
      await pool.query(
        'INSERT INTO teachers (id, name, expertSubjects, maxHoursPerWeek) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, expertSubjects=?, maxHoursPerWeek=?',
        [id, name, subjectsJson, maxHoursPerWeek, name, subjectsJson, maxHoursPerWeek]
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/classrooms', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM classrooms');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/classrooms', async (req, res) => {
    const { id, name, level } = req.body;
    try {
      await pool.query(
        'INSERT INTO classrooms (id, name, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=?, level=?',
        [id, name, level, name, level]
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/classrooms/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM classrooms WHERE id = ?', [req.params.id]);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/timetable', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM timetable');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/timetable/sync', async (req, res) => {
    const entries = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM timetable');
      if (entries.length > 0) {
        const values = entries.map((e: any) => [e.id, e.classroomId, e.subjectId, e.teacherId, e.day, e.period]);
        await connection.query('INSERT INTO timetable (id, classroomId, subjectId, teacherId, day, period) VALUES ?', [values]);
      }
      await connection.commit();
      res.sendStatus(200);
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      connection.release();
    }
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
