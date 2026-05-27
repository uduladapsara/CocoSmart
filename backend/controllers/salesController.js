const { Product, Order, PromoCode } = require('../models/Sales');

// Product Management
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, featured, search, minPrice, maxPrice } = req.query;
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(query).sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Management
exports.createOrder = async (req, res) => {
  try {
    const order = new Order({ ...req.body, customer: req.userId });
    await order.save();
    
    // Update stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    
    req.app.get('io').emit('new-order', { orderNumber: order.orderNumber, total: order.total });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'delivered') updateData.deliveredAt = new Date();
    
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Promo Code
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!promo) return res.status(404).json({ valid: false, message: 'Invalid code' });
    
    const now = new Date();
    if (now < promo.validFrom || now > promo.validTo) {
      return res.status(400).json({ valid: false, message: 'Code expired' });
    }
    
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Code usage limit reached' });
    }
    
    if (subtotal < promo.minPurchase) {
      return res.status(400).json({ valid: false, message: `Minimum purchase of LKR ${promo.minPurchase} required` });
    }
    
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.discountValue;
    }
    
    res.json({ valid: true, discount, code: promo.code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};