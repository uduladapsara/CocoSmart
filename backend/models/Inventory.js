const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, enum: ['raw_coconut', 'virgin_oil', 'refined_oil', 'desiccated', 'powder', 'packaging'], required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'liters', 'pieces', 'bottles'], default: 'kg' },
  batchNumber: { type: String, unique: true },
  expiryDate: { type: Date },
  purchasePrice: { type: Number },
  sellingPrice: { type: Number },
  location: { type: String }, // warehouse rack location
  status: { type: String, enum: ['in_stock', 'low_stock', 'expired', 'out_of_stock'], default: 'in_stock' },
  lowStockThreshold: { type: Number, default: 10 },
  qrCode: { type: String },
  supplier: { type: String },
  notes: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function(next) {
  if (this.quantity <= 0) this.status = 'out_of_stock';
  else if (this.quantity <= this.lowStockThreshold) this.status = 'low_stock';
  else if (this.expiryDate && new Date(this.expiryDate) < new Date()) this.status = 'expired';
  else this.status = 'in_stock';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);