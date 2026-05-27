const Inventory = require('../models/Inventory');
const QRCode = require('qrcode');

exports.createInventory = async (req, res) => {
  try {
    const batchNumber = `BATCH${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const inventory = new Inventory({ ...req.body, batchNumber });
    await inventory.save();
    
    // Generate QR Code
    const qrData = JSON.stringify({ id: inventory._id, batchNumber, productName: inventory.productName });
    const qrCode = await QRCode.toDataURL(qrData);
    inventory.qrCode = qrCode;
    await inventory.save();
    
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.productName = { $regex: search, $options: 'i' };
    
    const inventory = await Inventory.find(query).sort('-lastUpdated');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({ 
      $or: [
        { status: 'low_stock' },
        { quantity: { $lte: '$lowStockThreshold' } }
      ]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add', 'remove'
    
    const inventory = await Inventory.findById(id);
    if (!inventory) return res.status(404).json({ message: 'Item not found' });
    
    if (operation === 'add') inventory.quantity += quantity;
    else if (operation === 'remove') inventory.quantity -= quantity;
    
    inventory.lastUpdated = new Date();
    await inventory.save();
    
    // Send alert if low stock
    if (inventory.status === 'low_stock') {
      req.app.get('io').emit('low-stock-alert', { product: inventory.productName, quantity: inventory.quantity });
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpiringItems = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const items = await Inventory.find({
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};