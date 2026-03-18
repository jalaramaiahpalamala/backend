const express = require('express');
const { db } = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all attendance records
router.get('/', verifyToken, (req, res) => {
  db.all(`
    SELECT a.*, s.first_name, s.last_name, c.course_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.attendance_date DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get attendance for a student
router.get('/student/:studentId', verifyToken, (req, res) => {
  db.all(`
    SELECT a.*, c.course_name, c.course_code
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.student_id = ?
    ORDER BY a.attendance_date DESC
  `, [req.params.studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get attendance for a course
router.get('/course/:courseId', verifyToken, (req, res) => {
  db.all(`
    SELECT a.*, s.first_name, s.last_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE a.course_id = ?
    ORDER BY a.attendance_date DESC, s.first_name
  `, [req.params.courseId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Mark attendance
router.post('/', verifyToken, (req, res) => {
  const { student_id, course_id, attendance_date, status, remarks } = req.body;

  if (!student_id || !course_id || !attendance_date || !status) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  db.run(
    `INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks)
     VALUES (?, ?, ?, ?, ?)`,
    [student_id, course_id, attendance_date, status, remarks || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Attendance recorded', attendanceId: this.lastID });
    }
  );
});

// Update attendance
router.put('/:id', verifyToken, (req, res) => {
  const { status, remarks } = req.body;

  db.run(
    `UPDATE attendance SET status = ?, remarks = ? WHERE id = ?`,
    [status, remarks || '', req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      res.json({ message: 'Attendance updated' });
    }
  );
});

// Delete attendance record
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM attendance WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted' });
  });
});

module.exports = router;
