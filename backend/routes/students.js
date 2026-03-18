const express = require('express');
const { db } = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM students ORDER BY first_name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get student by ID
router.get('/:id', verifyToken, (req, res) => {
  db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(row);
  });
});

// Create student
router.post('/', verifyToken, (req, res) => {
  const {
    student_id,
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    gender,
    address,
    enrollment_date
  } = req.body;

  if (!student_id || !first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  db.run(
    `INSERT INTO students 
     (student_id, first_name, last_name, email, phone, date_of_birth, gender, address, enrollment_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [student_id, first_name, last_name, email, phone, date_of_birth, gender, address, enrollment_date || new Date().toISOString().split('T')[0]],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Student ID already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Student created', studentId: this.lastID });
    }
  );
});

// Update student
router.put('/:id', verifyToken, (req, res) => {
  const { first_name, last_name, email, phone, date_of_birth, gender, address, status } = req.body;

  db.run(
    `UPDATE students 
     SET first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, status = ?
     WHERE id = ?`,
    [first_name, last_name, email, phone, date_of_birth, gender, address, status, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json({ message: 'Student updated' });
    }
  );
});

// Delete student
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  });
});

module.exports = router;
