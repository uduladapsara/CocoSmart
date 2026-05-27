const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const { 
  createWorker, getAllWorkers, updateWorker, deleteWorker, markAttendance,
  createTask, getAllTasks, updateTaskStatus, deleteTask, getWorkerTasks, getDashboardStats
} = require('../controllers/labourController');

// Worker routes
router.post('/workers', auth, roleCheck('super_admin', 'farm_manager'), createWorker);
router.get('/workers', auth, getAllWorkers);
router.put('/workers/:id', auth, roleCheck('super_admin', 'farm_manager'), updateWorker);
router.delete('/workers/:id', auth, roleCheck('super_admin'), deleteWorker);
router.post('/workers/attendance', auth, markAttendance);

// Task routes
router.post('/tasks', auth, roleCheck('super_admin', 'farm_manager'), createTask);
router.get('/tasks', auth, getAllTasks);
router.put('/tasks/:id/status', auth, updateTaskStatus);
router.delete('/tasks/:id', auth, roleCheck('super_admin', 'farm_manager'), deleteTask);
router.get('/workers/:workerId/tasks', auth, getWorkerTasks);

// Dashboard
router.get('/dashboard/stats', auth, getDashboardStats);

module.exports = router;