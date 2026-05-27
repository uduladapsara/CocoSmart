const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  employeeId: { type: String, unique: true },
  role: { type: String, enum: ['harvester', 'pruner', 'fertilizer', 'irrigation', 'general'], required: true },
  phone: { type: String },
  address: { type: String },
  hourlyRate: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  assignedPlantations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plantation' }],
  skills: [String],
  attendance: [{
    date: Date,
    status: { type: String, enum: ['present', 'absent', 'half_day'] },
    hoursWorked: Number
  }]
});

module.exports = mongoose.model('Worker', workerSchema);