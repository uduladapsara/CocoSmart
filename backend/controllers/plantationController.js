const Plantation = require('../models/Plantation');
const Harvest = require('../models/Harvest');

exports.createPlantation = async (req, res) => {
  try {
    const plantation = new Plantation({ ...req.body, manager: req.userId });
    await plantation.save();
    res.status(201).json(plantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPlantations = async (req, res) => {
  try {
    const plantations = await Plantation.find().populate('manager', 'name email').populate('workers', 'name');
    res.json(plantations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlantationById = async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id).populate('manager workers');
    if (!plantation) return res.status(404).json({ message: 'Plantation not found' });
    res.json(plantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlantation = async (req, res) => {
  try {
    const plantation = await Plantation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plantation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePlantation = async (req, res) => {
  try {
    await Plantation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plantation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordHarvest = async (req, res) => {
  try {
    const harvest = new Harvest({ ...req.body, harvestedBy: req.userId });
    await harvest.save();
    
    // Update tree count if needed
    const plantation = await Plantation.findById(harvest.plantation);
    // Socket notification
    req.app.get('io').emit('harvest-recorded', { plantation: plantation.plotName, yield: harvest.yieldKg });
    
    res.status(201).json(harvest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHarvestHistory = async (req, res) => {
  try {
    const harvests = await Harvest.find({ plantation: req.params.plantationId }).populate('harvestedBy', 'name').sort('-harvestDate');
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};