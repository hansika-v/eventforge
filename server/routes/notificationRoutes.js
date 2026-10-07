const express = require('express');
const { getUserNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUserNotifications);

module.exports = router;
