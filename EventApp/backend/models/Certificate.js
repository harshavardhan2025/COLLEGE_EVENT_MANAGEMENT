const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['participation', 'winner', 'runner_up', 'special'], required: true },
  certificateId: { type: String, unique: true, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

certificateSchema.index({ event: 1, user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
