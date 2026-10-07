const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    status: { type: String, enum: ['draft', 'published', 'completed'], default: 'published' },
    date: { type: Date, required: true },
    endDate: Date,
    location: String,
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    capacity: { type: Number, default: 200 },
    imageUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
