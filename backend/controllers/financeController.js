const { Transaction, Salary } = require('../models/Finance');

// Transaction Management
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, recordedBy: req.userId });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const transactions = await Transaction.find(query)
      .populate('recordedBy', 'name')
      .sort('-date');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Financial Reports
exports.getFinancialSummary = async (req, res) => {
  try {
    const { period, year, month } = req.query; // period: daily, monthly, yearly
    
    let startDate, endDate;
    const now = new Date();
    
    if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === 'monthly' && year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else if (period === 'yearly' && year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
    }
    
    const incomes = await Transaction.aggregate([
      { $match: { type: 'income', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    const expenses = await Transaction.aggregate([
      { $match: { type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    const totalIncome = incomes.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.total, 0);
    
    res.json({
      period: { startDate, endDate },
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomesByCategory: incomes,
      expensesByCategory: expenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Salary Management
exports.createSalary = async (req, res) => {
  try {
    const salary = new Salary(req.body);
    await salary.save();
    res.status(201).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate('worker', 'name').populate('paidBy', 'name');
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markSalaryPaid = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidDate: new Date(), paidBy: req.userId },
      { new: true }
    );
    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};