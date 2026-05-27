const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const { createInventory, getAllInventory, getLowStockItems, updateStock, getExpiringItems, deleteInventory } = require('../controllers/inventoryController');

router.post('/', auth, roleCheck('super_admin', 'warehouse_staff', 'farm_manager'), createInventory);
router.get('/', auth, getAllInventory);
router.get('/low-stock', auth, getLowStockItems);
router.get('/expiring', auth, getExpiringItems);
router.put('/:id/stock', auth, updateStock);
router.delete('/:id', auth, roleCheck('super_admin'), deleteInventory);

module.exports = router;