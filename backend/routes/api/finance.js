const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const {
  createTransaction, getAllTransactions, updateTransaction, deleteTransaction,
  getFinancialSummary, createSalary, getAllSalaries, markSalaryPaid
} = require('../controllers/financeController');

router.post('/transactions', auth, roleCheck('super_admin', 'finance_officer'), createTransaction);
router.get('/transactions', auth, getAllTransactions);
router.put('/transactions/:id', auth, roleCheck('super_admin', 'finance_officer'), updateTransaction);
router.delete('/transactions/:id', auth, roleCheck('super_admin'), deleteTransaction);

router.get('/summary', auth, getFinancialSummary);

router.post('/salaries', auth, roleCheck('super_admin', 'finance_officer'), createSalary);
router.get('/salaries', auth, getAllSalaries);
router.put('/salaries/:id/paid', auth, roleCheck('super_admin', 'finance_officer'), markSalaryPaid);

module.exports = router;