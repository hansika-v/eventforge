const express = require('express');
const { getImpactOverview } = require('../controllers/impactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, getImpactOverview);

module.exports = router;
