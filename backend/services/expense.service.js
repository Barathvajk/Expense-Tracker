const Expense = require("../models/Expense");
const ApiError = require("../utils/ApiError");

// CREATE
const createExpense = async (userId, data) => {
  const expense = await Expense.create({
    user: userId,
    amount: Number(data.amount),
    category: data.category,
    description: data.description || "",
    date: data.date,
  });
  return expense;
};

// GET ALL for current user (all expenses — filtering done on frontend)
const getExpenses = async (userId) => {
  const expenses = await Expense.find({ user: userId }).sort({ date: -1, createdAt: -1 });
  return expenses;
};

// UPDATE
const updateExpense = async (userId, expenseId, data) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) throw new ApiError(404, "Expense not found");

  expense.amount      = data.amount      ?? expense.amount;
  expense.category    = data.category    ?? expense.category;
  expense.description = data.description ?? expense.description;
  expense.date        = data.date        ?? expense.date;

  const updated = await expense.save();
  return updated;
};

// DELETE
const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) throw new ApiError(404, "Expense not found");
  await expense.deleteOne();
};

// CATEGORY SUMMARY
const getCategorySummary = async (userId) => {
  const summary = await Expense.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  const result = {};
  summary.forEach((item) => {
    result[item._id] = { total: item.totalAmount, count: item.count };
  });
  return result;
};

// MONTHLY SPENDING
const getMonthlySpending = async (userId) => {
  const data = await Expense.aggregate([
    { $match: { user: userId } },
    { $addFields: { dateObj: { $toDate: "$date" } } },
    {
      $group: {
        _id: {
          year:  { $year:  "$dateObj" },
          month: { $month: "$dateObj" },
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map((e) => ({
    month: `${e._id.year}-${String(e._id.month).padStart(2, "0")}`,
    total: e.total,
    count: e.count,
  }));
};

// CSV EXPORT — returns CSV string
const exportCSV = async (userId) => {
  const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

  const header = "Date,Category,Description,Amount\n";
  const rows = expenses
    .map(
      (e) =>
        `${e.date},${e.category},"${(e.description || "").replace(/"/g, '""')}",${e.amount}`
    )
    .join("\n");

  return header + rows;
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
