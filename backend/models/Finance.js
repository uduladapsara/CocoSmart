const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['sales', 'salary', 'transport', 'fertilizer', 'maintenance', 'utility', 'rent', 'tax', 'other'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now, required: true },
  reference: { type: String }, // order number, invoice number
  paymentMethod: { type: String, enum: ['cash', 'bank', 'card', 'online'], default: 'cash' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachments: [String],
  notes: { type: String }
});

transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

const salarySchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  baseSalary: { type: Number },
  hourlyRate: { type: Number },
  hoursWorked: { type: Number },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidDate: { type: Date },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  Salary: mongoose.model('Salary', salarySchema)
};