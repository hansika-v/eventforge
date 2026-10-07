const express = require('express');
const { getTicketTypes, createTicketType, updateTicketType, deleteTicketType } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTicketTypes);
router.post('/', protect, authorize('organizer', 'admin'), createTicketType);
router.put('/:id', protect, authorize('organizer', 'admin'), updateTicketType);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteTicketType);

module.exports = router;
