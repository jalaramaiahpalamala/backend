const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../data/smcp.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        date_of_birth TEXT,
        gender TEXT,
        address TEXT,
        enrollment_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT UNIQUE NOT NULL,
        course_name TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        credits INTEGER DEFAULT 3,
        semester TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student Enrollment table
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrollment_date TEXT,
        status TEXT DEFAULT 'active',
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Grades table
    db.run(`
      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        assignment1 REAL,
        assignment2 REAL,
        midterm REAL,
        final_exam REAL,
        grade TEXT,
        gpa REAL,
        recorded_date TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Attendance table
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        attendance_date TEXT NOT NULL,
        status TEXT NOT NULL,
        remarks TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      )
    `);

    // Create default admin user if not exists
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)`,
      ['admin', adminPassword, 'Administrator', 'admin'],
      (err) => {
        if (err) console.error('Error creating admin user:', err);
        else console.log('Database initialized successfully');
      }
    );
  });
};

module.exports = { db, initDatabase };
