const express = require('express');
const { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } = require('../controllers/speakerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getSpeakers);
router.post('/', protect, authorize('organizer', 'admin'), createSpeaker);
router.put('/:id', protect, authorize('organizer', 'admin'), updateSpeaker);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteSpeaker);

module.exports = router;
