const express = require('express');
const { getRegistrations, getMyRegistrations, createRegistration, checkInRegistration } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('organizer', 'admin', 'staff'), getRegistrations);
router.get('/me', protect, getMyRegistrations);
router.post('/', protect, createRegistration);
router.put('/:id/checkin', protect, authorize('organizer', 'admin', 'staff'), checkInRegistration);

module.exports = router;
