const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const {
  createVehicle, getAllVehicles, updateVehicle, deleteVehicle,
  createDriver, getAllDrivers, updateDriver, deleteDriver,
  createTrip, getAllTrips, updateTripStatus, deleteTrip, getTripStats
} = require('../controllers/transportController');

// Vehicle routes
router.post('/vehicles', auth, roleCheck('super_admin', 'farm_manager'), createVehicle);
router.get('/vehicles', auth, getAllVehicles);
router.put('/vehicles/:id', auth, roleCheck('super_admin', 'farm_manager'), updateVehicle);
router.delete('/vehicles/:id', auth, roleCheck('super_admin'), deleteVehicle);

// Driver routes
router.post('/drivers', auth, roleCheck('super_admin', 'farm_manager'), createDriver);
router.get('/drivers', auth, getAllDrivers);
router.put('/drivers/:id', auth, roleCheck('super_admin', 'farm_manager'), updateDriver);
router.delete('/drivers/:id', auth, roleCheck('super_admin'), deleteDriver);

// Trip routes
router.post('/trips', auth, roleCheck('super_admin', 'farm_manager'), createTrip);
router.get('/trips', auth, getAllTrips);
router.put('/trips/:id/status', auth, updateTripStatus);
router.delete('/trips/:id', auth, roleCheck('super_admin'), deleteTrip);
router.get('/stats', auth, getTripStats);

module.exports = router;