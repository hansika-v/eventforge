const Task = require('../models/Task');
const User = require('../models/User');

const getImpactOverview = async (req, res) => {
  try {
    const [taskCount, volunteerCount, totalMinutes, totalImpactPoints] = await Promise.all([
      Task.countDocuments(),
      User.countDocuments(),
      Task.aggregate([{ $group: { _id: null, total: { $sum: '$duration' } } }]),
      Task.aggregate([{ $group: { _id: null, total: { $sum: '$impactPoints' } } }]),
    ]);

    return res.json({
      totalTasks: taskCount,
      totalVolunteers: volunteerCount,
      totalMinutes: totalMinutes[0]?.total || 0,
      totalImpactPoints: totalImpactPoints[0]?.total || 0,
      topCause: 'Community Impact',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Impact overview unavailable' });
  }
};

module.exports = { getImpactOverview };
