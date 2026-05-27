const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../controllers/authController');
const { auth, roleCheck } = require('../middleware/auth');

router.get('/', auth, roleCheck('super_admin', 'farm_manager'), getAllUsers);
router.put('/:id', auth, roleCheck('super_admin'), updateUser);
router.delete('/:id', auth, roleCheck('super_admin'), deleteUser);

module.exports = router;