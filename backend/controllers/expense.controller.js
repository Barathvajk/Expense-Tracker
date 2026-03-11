const expenseService = require("../services/expense.service");
const { sendSuccess } = require("../utils/ApiResponse");

const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.user._id, req.body);
    sendSuccess(res, 201, "Expense created", expense);
  } catch (err) {
    next(err);
  }
};

const getExpenses = async (req, res, next) => {
  try {
    console.log("User ID:", req.user._id);
    const expenses = await expenseService.getExpenses(req.user._id);
    console.log("Expenses found:", expenses.length);
    sendSuccess(res, 200, "Expenses fetched", expenses);
  } catch (err) {
    next(err);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.user._id, req.params.id, req.body);
    sendSuccess(res, 200, "Expense updated", expense);
  } catch (err) {
    next(err);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user._id, req.params.id);
    sendSuccess(res, 200, "Expense deleted");
  } catch (err) {
    next(err);
  }
};

const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await expenseService.getCategorySummary(req.user._id);
    sendSuccess(res, 200, "Summary fetched", summary);
  } catch (err) {
    next(err);
  }
};

const getMonthlySpending = async (req, res, next) => {
  try {
    const data = await expenseService.getMonthlySpending(req.user._id);
    sendSuccess(res, 200, "Monthly spending fetched", data);
  } catch (err) {
    next(err);
  }
};

const exportCSV = async (req, res, next) => {
  try {
    const csv = await expenseService.exportCSV(req.user._id);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expenses_${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCategorySummary,
  getMonthlySpending,
  exportCSV,
};
