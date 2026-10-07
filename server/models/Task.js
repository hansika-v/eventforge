const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Education',
        'Translation',
        'Design',
        'Digital Assistance',
        'Community Support',
        'Environment',
        'Donation / Charity',
        'Event Support',
        'Accessibility',
        'Elderly Assistance',
        'Documentation',
        'Social Awareness',
      ],
      required: true,
    },
    requiredSkills: [{ type: String }],
    duration: { type: Number, required: true },
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
    location: { type: String, default: 'Remote' },
    urgency: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
    cause: { type: String, required: true },
    deadline: { type: Date, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'EXPIRED'],
      default: 'AVAILABLE',
    },
    proofRequired: { type: Boolean, default: false },
    proof: { type: String, default: '' },
    completionNote: { type: String, default: '' },
    completionConfirmed: { type: Boolean, default: false },
    impactPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
