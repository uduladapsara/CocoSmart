const { Vehicle, Driver, Trip } = require('../models/Transport');

// Vehicle CRUD
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Driver CRUD
exports.createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedVehicle');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trip Management
exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    
    // Update vehicle status if needed
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'active' });
    
    req.app.get('io').emit('trip-scheduled', { tripId: trip.tripId, driver: trip.driver });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTrips = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.scheduledDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const trips = await Trip.find(query)
      .populate('vehicle')
      .populate('driver')
      .sort('-scheduledDate');
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTripStatus = async (req, res) => {
  try {
    const { status, fuelUsed, cost, completedDate } = req.body;
    const updateData = { status };
    if (fuelUsed) updateData.fuelUsed = fuelUsed;
    if (cost) updateData.cost = cost;
    if (completedDate) updateData.completedDate = completedDate;
    if (status === 'completed') updateData.completedDate = new Date();
    
    const trip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTripStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    const inProgressTrips = await Trip.countDocuments({ status: 'in_progress' });
    
    const totalCost = await Trip.aggregate([
      { $match: { cost: { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    
    const monthlyTrips = await Trip.aggregate([
      { $group: { _id: { $month: '$scheduledDate' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalTrips,
      completedTrips,
      inProgressTrips,
      completionRate: totalTrips ? ((completedTrips / totalTrips) * 100).toFixed(1) : 0,
      totalCost: totalCost[0]?.total || 0,
      monthlyTrips
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};