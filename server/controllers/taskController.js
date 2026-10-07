const Task = require('../models/Task');
const User = require('../models/User');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, duration, mode, location, urgency, cause, deadline } = req.body;

    if (!title || !description || !category || !duration || !cause || !deadline) {
      return res.status(400).json({ message: 'Missing required task fields' });
    }

    const task = await Task.create({
      title,
      description,
      category,
      requiredSkills: requiredSkills || [],
      duration,
      mode: mode || 'Online',
      location: location || 'Remote',
      urgency: urgency || 'Normal',
      cause,
      deadline: new Date(deadline),
      postedBy: req.user._id,
      status: 'AVAILABLE',
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Task creation failed' });
  }
};

const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'This task is no longer available' });
    }

    task.acceptedBy = req.user._id;
    task.status = 'ACCEPTED';
    await task.save();

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to accept task' });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.acceptedBy && task.acceptedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot complete this task' });
    }

    task.status = 'COMPLETED';
    task.completionNote = req.body.completionNote || task.completionNote || 'Completed';
    task.completionConfirmed = true;
    task.completedAt = new Date();
    await task.save();

    const user = await User.findById(req.user._id);
    if (user) {
      user.stats.completedTasks += 1;
      user.stats.totalMinutes += Number(task.duration || 0);
      user.stats.impactPoints += Number(task.impactPoints || task.duration || 0);
      await user.save();
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to complete task' });
  }
};

module.exports = { getTasks, createTask, acceptTask, completeTask };
