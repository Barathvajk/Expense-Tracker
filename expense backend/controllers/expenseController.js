const Expense = require("../models/Expense");

// CREATE
exports.createExpense = async (req, res) => {
  try {

    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date
    });

    res.status(201).json(expense);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL
exports.getExpenses = async (req, res) => {
  try {

    const expenses = await Expense.find({ user: req.user._id });

    res.json(expenses);

  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
};


// UPDATE
exports.updateExpense = async (req, res) => {
  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.amount = req.body.amount ?? expense.amount;
    expense.category = req.body.category ?? expense.category;
    expense.description = req.body.description ?? expense.description;
    expense.date = req.body.date ?? expense.date;

    const updatedExpense = await expense.save();

    res.json(updatedExpense);

  } catch (error) {
    res.status(500).json({ message: "Error updating expense" });
  }
};


// DELETE
exports.deleteExpense = async (req, res) => {
  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.json({ message: "Expense deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting expense" });
  }
};