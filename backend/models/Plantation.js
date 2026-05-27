const mongoose = require('mongoose');

const plantationSchema = new mongoose.Schema({
  plotName: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { lat: Number, lng: Number },
  size: { type: Number, required: true }, // in acres
  treeCount: { type: Number, default: 0 },
  coconutVariety: { type: String, enum: ['tall', 'dwarf', 'hybrid'], default: 'hybrid' },
  plantingDate: { type: Date },
  soilType: { type: String },
  status: { type: String, enum: ['active', 'fallow', 'harvesting'], default: 'active' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plantation', plantationSchema);