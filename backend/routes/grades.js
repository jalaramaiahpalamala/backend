const express = require('express');
const { db } = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Utility to calculate letter grade
const calculateGrade = (gpa) => {
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B+';
  if (gpa >= 2.7) return 'B';
  if (gpa >= 2.3) return 'B-';
  if (gpa >= 2.0) return 'C+';
  if (gpa >= 1.7) return 'C';
  if (gpa >= 1.3) return 'C-';
  if (gpa >= 1.0) return 'D';
  return 'F';
};

// Calculate GPA from components
const calculateGPA = (a1, a2, mid, final) => {
  const weights = { a1: 0.15, a2: 0.15, mid: 0.30, final: 0.40 };
  if (a1 === null || a2 === null || mid === null || final === null) return null;
  return (a1 * weights.a1 + a2 * weights.a2 + mid * weights.mid + final * weights.final) / 100 * 4.0;
};

// Get all grades
router.get('/', verifyToken, (req, res) => {
  db.all(`
    SELECT g.*, s.first_name, s.last_name, c.course_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses c ON g.course_id = c.id
    ORDER BY s.first_name
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Get grades for a student
router.get('/student/:studentId', verifyToken, (req, res) => {
  db.all(`
    SELECT g.*, c.course_name, c.course_code
    FROM grades g
    JOIN courses c ON g.course_id = c.id
    WHERE g.student_id = ?
    ORDER BY c.course_name
  `, [req.params.studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Record grades
router.post('/', verifyToken, (req, res) => {
  const { student_id, course_id, assignment1, assignment2, midterm, final_exam } = req.body;

  if (!student_id || !course_id) {
    return res.status(400).json({ error: 'Student and course required' });
  }

  const gpa = calculateGPA(assignment1, assignment2, midterm, final_exam);
  const grade = gpa ? calculateGrade(gpa) : null;

  db.run(
    `INSERT INTO grades 
     (student_id, course_id, assignment1, assignment2, midterm, final_exam, grade, gpa, recorded_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [student_id, course_id, assignment1, assignment2, midterm, final_exam, grade, gpa, new Date().toISOString().split('T')[0]],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Grades recorded', gradeId: this.lastID, gpa, grade });
    }
  );
});

// Update grades
router.put('/:id', verifyToken, (req, res) => {
  const { assignment1, assignment2, midterm, final_exam } = req.body;

  const gpa = calculateGPA(assignment1, assignment2, midterm, final_exam);
  const grade = gpa ? calculateGrade(gpa) : null;

  db.run(
    `UPDATE grades 
     SET assignment1 = ?, assignment2 = ?, midterm = ?, final_exam = ?, grade = ?, gpa = ?
     WHERE id = ?`,
    [assignment1, assignment2, midterm, final_exam, grade, gpa, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Grade record not found' });
      }
      res.json({ message: 'Grades updated', gpa, grade });
    }
  );
});

// Delete grade record
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM grades WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Grade record not found' });
    }
    res.json({ message: 'Grade record deleted' });
  });
});

module.exports = router;
