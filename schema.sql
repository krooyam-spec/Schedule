-- SQL Schema for SiamSchedule
-- Use this file to import into PHPMyAdmin (MySQL)

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(20),
  name VARCHAR(100),
  category VARCHAR(100),
  hoursPerWeek INT
);

CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  expertSubjects TEXT,
  maxHoursPerWeek INT
);

CREATE TABLE IF NOT EXISTS classrooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50),
  level VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS timetable (
  id VARCHAR(50) PRIMARY KEY,
  classroomId VARCHAR(50),
  subjectId VARCHAR(50),
  teacherId VARCHAR(50),
  day VARCHAR(20),
  period INT
);
