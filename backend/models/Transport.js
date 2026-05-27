const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['truck', 'van', 'tractor', 'three_wheeler'], required: true },
  capacity: { type: Number, required: true }, // in kg
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric'] },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  insuranceExpiry: { type: Date },
  owner: { type: String },
  notes: { type: String }
});

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }
});

const tripSchema = new mongoose.Schema({
  tripId: { type: String, unique: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  type: { type: String, enum: ['farm_to_warehouse', 'warehouse_to_customer', 'farm_to_market'], required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  cargoType: { type: String },
  cargoWeight: { type: Number },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'], default: 'scheduled' },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  distance: { type: Number }, // in km
  fuelUsed: { type: Number },
  cost: { type: Number },
  notes: { type: String },
  waypoints: [String],
  createdAt: { type: Date, default: Date.now }
});

tripSchema.pre('save', function(next) {
  if (!this.tripId) {
    this.tripId = `TRIP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = {
  Vehicle: mongoose.model('Vehicle', vehicleSchema),
  Driver: mongoose.model('Driver', driverSchema),
  Trip: mongoose.model('Trip', tripSchema)
};