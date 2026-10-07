const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return { seeded: false, message: 'Database already contains users' };
    }

    const hashed = await bcrypt.hash('Password123!', 10);

    const requester = await User.create({
      name: 'Maria Gomez',
      email: 'requester@example.com',
      password: hashed,
      role: 'requester',
      skills: ['Community Support'],
      interests: ['Education', 'Health'],
      causes: ['Youth Support'],
      profile: { location: 'New York', organizationName: 'City Learning Hub' },
    });

    const volunteer = await User.create({
      name: 'Alex Lee',
      email: 'volunteer@example.com',
      password: hashed,
      role: 'volunteer',
      skills: ['Design', 'Documentation', 'Translation'],
      interests: ['Education', 'Community Support'],
      causes: ['Education', 'Disability Inclusion'],
      profile: { location: 'Remote', bio: 'Helping nonprofits with digital support.' },
      preferences: { availableTime: 90, preferredMode: 'Remote', location: 'Remote' },
      stats: { completedTasks: 3, totalMinutes: 180, impactPoints: 160 },
    });

    const task = await Task.create({
      title: 'Create digital handout for community workshop',
      description: 'Design a clean one-page flyer for a weekend workshop and share it in the community channel.',
      category: 'Design',
      requiredSkills: ['Design'],
      duration: 90,
      mode: 'Online',
      location: 'Remote',
      urgency: 'High',
      cause: 'Education',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      postedBy: requester._id,
      status: 'AVAILABLE',
      impactPoints: 120,
    });

    return { seeded: true, user: volunteer, task };
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
};

module.exports = { seedData };
