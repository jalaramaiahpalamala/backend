const express = require('express');
const { db } = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM courses ORDER BY course_code', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get course by ID
router.get('/:id', verifyToken, (req, res) => {
  db.get('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(row);
  });
});

// Create course
router.post('/', verifyToken, (req, res) => {
  const { course_code, course_name, description, instructor, credits, semester } = req.body;

  if (!course_code || !course_name) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  db.run(
    `INSERT INTO courses (course_code, course_name, description, instructor, credits, semester)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [course_code, course_name, description, instructor, credits || 3, semester],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Course code already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Course created', courseId: this.lastID });
    }
  );
});

// Update course
router.put('/:id', verifyToken, (req, res) => {
  const { course_name, description, instructor, credits, semester } = req.body;

  db.run(
    `UPDATE courses 
     SET course_name = ?, description = ?, instructor = ?, credits = ?, semester = ?
     WHERE id = ?`,
    [course_name, description, instructor, credits, semester, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json({ message: 'Course updated' });
    }
  );
});

// Delete course
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM courses WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  });
});

// Enroll student in course
router.post('/:courseId/enroll/:studentId', verifyToken, (req, res) => {
  const { courseId, studentId } = req.params;

  db.run(
    `INSERT INTO enrollments (student_id, course_id, enrollment_date, status)
     VALUES (?, ?, ?, 'active')`,
    [studentId, courseId, new Date().toISOString().split('T')[0]],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Student enrolled in course' });
    }
  );
});

// Get enrolled students for a course
router.get('/:courseId/students', verifyToken, (req, res) => {
  const query = `
    SELECT s.*, e.enrollment_date, e.status
    FROM students s
    INNER JOIN enrollments e ON s.id = e.student_id
    WHERE e.course_id = ?
    ORDER BY s.first_name
  `;

  db.all(query, [req.params.courseId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

module.exports = router;
