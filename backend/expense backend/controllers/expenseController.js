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

    const { month, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    let filter = { user: req.user._id };

    // Month filter
    if (month) {

      const startDate = new Date(month + "-01");
      const endDate = new Date(startDate);

      endDate.setMonth(endDate.getMonth() + 1);

      filter.createdAt = {
        $gte: startDate,
        $lt: endDate
      };

    }

    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalExpenses = await Expense.countDocuments(filter);

    res.json({
      total: totalExpenses,
      page: pageNumber,
      pages: Math.ceil(totalExpenses / limitNumber),
      expenses
    });

  } catch (error) {

    console.error(error);
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

// EXPENSE SUMMARY (Category-wise total)

exports.getExpenseSummary = async (req, res) => {
  try {

    const summary = await Expense.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const formattedSummary = {};

    summary.forEach(item => {
      formattedSummary[item._id] = item.totalAmount;
    });

    res.json(formattedSummary);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating summary" });
  }
};

// MONTHLY SPENDING ANALYTICS

exports.getMonthlySpending = async (req, res) => {
  try {

    const expenses = await Expense.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $addFields: {
          dateObj: { $toDate: "$date" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    const formatted = expenses.map(e => ({
      month: `${e._id.year}-${String(e._id.month).padStart(2,"0")}`,
      total: e.total
    }))

    res.json(formatted)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}