const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'organizer', 'staff', 'speaker', 'attendee', 'sponsor'],
      default: 'attendee',
    },
    company: String,
    phone: String,
    profile: {
      avatar: String,
      bio: String,
      location: String,
      organizationName: String,
      website: String,
    },
    preferences: {
      interests: [{ type: String }],
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
