const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.get('/admin-only', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
  });
});

module.exports = { testRoutes: router };

