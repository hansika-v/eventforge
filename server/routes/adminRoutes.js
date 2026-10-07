const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    message: 'Admin dashboard ready',
    totalRequests: 42,
    totalVolunteers: 138,
    resolutionRate: '96%',
  });
});

module.exports = router;
