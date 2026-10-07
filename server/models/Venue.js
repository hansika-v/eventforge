const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    city: String,
    capacity: { type: Number, default: 200 },
    description: String,
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
