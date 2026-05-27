const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['oil', 'powder', 'liquid', 'raw', 'snacks'], required: true },
  subCategory: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // for discount display
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, enum: ['kg', 'liter', 'bottle', 'piece'], default: 'kg' },
  images: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  weight: { type: Number }, // in grams
  nutritionalInfo: {
    calories: Number,
    fat: Number,
    saturatedFat: Number,
    carbohydrates: Number,
    protein: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'cash_on_delivery', 'bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    district: String,
    phone: String
  },
  trackingNumber: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date }
});

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

module.exports = {
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema),
  PromoCode: mongoose.model('PromoCode', promoCodeSchema)
};