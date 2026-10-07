const express = require('express');
const { getVenues, createVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getVenues);
router.post('/', protect, authorize('organizer', 'admin'), createVenue);
router.put('/:id', protect, authorize('organizer', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteVenue);

module.exports = router;
