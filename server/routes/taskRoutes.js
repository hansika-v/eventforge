const express = require('express');
const { getTasks, createTask, acceptTask, completeTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, authorize('requester', 'admin'), createTask);
router.post('/:id/accept', protect, authorize('volunteer', 'admin'), acceptTask);
router.post('/:id/complete', protect, authorize('volunteer', 'admin'), completeTask);

module.exports = router;
