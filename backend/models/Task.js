const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['harvesting', 'pruning', 'fertilizing', 'irrigation', 'pest_control', 'maintenance'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'on_hold', 'overdue'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plantation: { type: mongoose.Schema.Types.ObjectId, ref: 'Plantation' },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  notes: { type: String },
  attachments: [String],
  createdAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  if (this.dueDate < new Date() && this.status !== 'completed') {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);