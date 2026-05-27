const Worker = require('../models/Worker');
const Task = require('../models/Task');
const User = require('../models/User');

// Worker Management
exports.createWorker = async (req, res) => {
  try {
    const employeeId = `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const worker = new Worker({ ...req.body, employeeId });
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().populate('assignedPlantations', 'plotName');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: 'Worker deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { workerId, date, status, hoursWorked } = req.body;
    const worker = await Worker.findById(workerId);
    
    const existingIndex = worker.attendance.findIndex(a => a.date.toDateString() === new Date(date).toDateString());
    if (existingIndex >= 0) {
      worker.attendance[existingIndex] = { date, status, hoursWorked };
    } else {
      worker.attendance.push({ date, status, hoursWorked });
    }
    
    await worker.save();
    res.json({ message: 'Attendance marked', attendance: worker.attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Task Management
exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, assignedBy: req.userId });
    await task.save();
    
    // Send notification via socket
    req.app.get('io').emit('new-task', { task: task.title, assignedTo: task.assignedTo });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name')
      .populate('plantation', 'plotName')
      .sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, actualHours, notes } = req.body;
    const updateData = { status };
    if (actualHours) updateData.actualHours = actualHours;
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.completedAt = new Date();
    
    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.workerId })
      .populate('plantation', 'plotName')
      .sort('-dueDate');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments({ status: 'active' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const overdueTasks = await Task.countDocuments({ status: 'overdue' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    
    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const recentTasks = await Task.find()
      .populate('assignedTo', 'name')
      .limit(5)
      .sort('-createdAt');
    
    res.json({
      totalWorkers,
      totalTasks,
      completedTasks,
      overdueTasks,
      pendingTasks,
      completionRate: totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      tasksByPriority,
      tasksByStatus,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};