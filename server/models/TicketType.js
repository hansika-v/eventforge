const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 100 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketType', ticketTypeSchema);
