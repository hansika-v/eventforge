const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    room: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, default: 80 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
