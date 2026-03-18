const express = require('express');
const { db } = require('../models/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get student report card
router.get('/student/:studentId', verifyToken, (req, res) => {
  const query = `
    SELECT 
      s.id, s.student_id, s.first_name, s.last_name, s.email,
      COUNT(DISTINCT e.id) as total_courses_enrolled,
      AVG(g.gpa) as overall_gpa,
      GROUP_CONCAT(g.grade) as grades
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    LEFT JOIN grades g ON s.id = g.student_id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.get(query, [req.params.studentId], (err, reportCard) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!reportCard) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get detailed grades
    db.all(
      `SELECT g.*, c.course_name, c.course_code 
       FROM grades g
       JOIN courses c ON g.course_id = c.id
       WHERE g.student_id = ?`,
      [req.params.studentId],
      (err, grades) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ ...reportCard, grades: grades || [] });
      }
    );
  });
});

// Get class performance analytics
router.get('/class/:courseId', verifyToken, (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.course_code,
      c.course_name,
      COUNT(DISTINCT e.student_id) as total_students,
      AVG(g.gpa) as class_average_gpa,
      MAX(g.gpa) as highest_gpa,
      MIN(g.gpa) as lowest_gpa
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN grades g ON c.id = g.course_id
    WHERE c.id = ?
    GROUP BY c.id
  `;

  db.get(query, [req.params.courseId], (err, analytics) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!analytics) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get student-wise grades for the course
    db.all(
      `SELECT s.first_name, s.last_name, g.gpa, g.grade
       FROM students s
       JOIN grades g ON s.id = g.student_id
       WHERE g.course_id = ?
       ORDER BY g.gpa DESC`,
      [req.params.courseId],
      (err, studentGrades) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ ...analytics, studentGrades: studentGrades || [] });
      }
    );
  });
});

// Get attendance summary
router.get('/attendance/:studentId', verifyToken, (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_classes,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
      SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
      SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days,
      ROUND(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_percentage
    FROM attendance
    WHERE student_id = ?
  `;

  db.get(query, [req.params.studentId], (err, summary) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(summary || { total_classes: 0, present_days: 0, absent_days: 0, late_days: 0, attendance_percentage: 0 });
  });
});

// Get all students report
router.get('/all-students', verifyToken, (req, res) => {
  const query = `
    SELECT 
      s.id, s.student_id, s.first_name, s.last_name, s.email,
      COUNT(DISTINCT e.id) as courses_enrolled,
      AVG(g.gpa) as average_gpa
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    LEFT JOIN grades g ON s.id = g.student_id
    GROUP BY s.id
    ORDER BY s.first_name
  `;

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

module.exports = router;
