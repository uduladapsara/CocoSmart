const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const { createPlantation, getAllPlantations, getPlantationById, updatePlantation, deletePlantation, recordHarvest, getHarvestHistory } = require('../controllers/plantationController');

router.post('/', auth, roleCheck('super_admin', 'farm_manager'), createPlantation);
router.get('/', auth, getAllPlantations);
router.get('/:id', auth, getPlantationById);
router.put('/:id', auth, roleCheck('super_admin', 'farm_manager'), updatePlantation);
router.delete('/:id', auth, roleCheck('super_admin'), deletePlantation);
router.post('/harvest', auth, recordHarvest);
router.get('/:plantationId/harvests', auth, getHarvestHistory);

module.exports = router;