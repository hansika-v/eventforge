const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(20);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...updates } },
      { new: true }
    ).select('-password');

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Profile update failed' });
  }
};

module.exports = { getUsers, getUserById, updateProfile };
