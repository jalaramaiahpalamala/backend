const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../models/database');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });
  });
});

// Register (Public - anyone can register)
router.post('/register', (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, name, 'staff'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'Account created successfully! You can now login.',
        userId: this.lastID
      });
    }
  );
});

// Register as Admin (Admin only - for creating admin/staff accounts)
router.post('/register-admin', verifyToken, (req, res) => {
  const { username, password, name, role } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, name, role || 'staff'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'User registered successfully',
        userId: this.lastID,
        username: username,
        role: role || 'staff'
      });
    }
  );
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  db.get('SELECT id, username, name, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(user);
  });
});

// Get all users (Admin only)
router.get('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all('SELECT id, name, username, role, created_at FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

// Delete user (Admin only)
router.delete('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Prevent deleting your own account
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;
