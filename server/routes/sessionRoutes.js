const express = require('express');
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getSessions);
router.post('/', protect, authorize('organizer', 'admin', 'staff'), createSession);
router.put('/:id', protect, authorize('organizer', 'admin', 'staff'), updateSession);
router.delete('/:id', protect, authorize('organizer', 'admin', 'staff'), deleteSession);

module.exports = router;
