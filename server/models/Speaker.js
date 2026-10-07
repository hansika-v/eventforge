const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: String,
    company: String,
    bio: String,
    expertise: [{ type: String }],
    photo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Speaker', speakerSchema);
