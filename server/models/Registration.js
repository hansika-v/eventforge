const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketType: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketType', required: true },
    ticketCode: { type: String, required: true, unique: true },
    selectedSessionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    status: { type: String, enum: ['registered', 'checked_in', 'cancelled'], default: 'registered' },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
