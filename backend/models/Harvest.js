const mongoose = require('mongoose');

const harvestSchema = new mongoose.Schema({
  plantation: { type: mongoose.Schema.Types.ObjectId, ref: 'Plantation', required: true },
  harvestDate: { type: Date, required: true },
  yieldKg: { type: Number, required: true },
  coconutsCount: { type: Number, required: true },
  quality: { type: String, enum: ['premium', 'standard', 'low'], default: 'standard' },
  harvestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Harvest', harvestSchema);