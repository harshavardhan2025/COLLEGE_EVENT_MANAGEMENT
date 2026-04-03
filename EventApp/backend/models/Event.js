const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'], required: true },
  description: { type: String, trim: true },
  department: { type: String, required: true, trim: true },
  timeSlot: { type: String, enum: ['Morning', 'Evening'], default: 'Morning' },
  venue: { type: String, required: true, trim: true },
  coordinator: { type: String, trim: true },
  coordinatorPhone: { type: String, trim: true },
  rules: { type: String, trim: true },
  poster: { type: String }, // file path or URL
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  maxParticipants: { type: Number, default: 100 },
  currentRegistrations: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
