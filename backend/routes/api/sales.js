const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const {
  createProduct, getAllProducts, getProductById, updateProduct, deleteProduct,
  createOrder, getMyOrders, getAllOrders, updateOrderStatus, validatePromoCode
} = require('../controllers/salesController');

// Product routes (public read, admin write)
router.post('/products', auth, roleCheck('super_admin', 'farm_manager'), createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', auth, roleCheck('super_admin', 'farm_manager'), updateProduct);
router.delete('/products/:id', auth, roleCheck('super_admin'), deleteProduct);

// Order routes
router.post('/orders', auth, createOrder);
router.get('/orders/my', auth, getMyOrders);
router.get('/orders', auth, roleCheck('super_admin', 'farm_manager', 'finance_officer'), getAllOrders);
router.put('/orders/:id/status', auth, roleCheck('super_admin', 'farm_manager'), updateOrderStatus);

// Promo code
router.post('/promo/validate', validatePromoCode);

module.exports = router;