const { CATEGORIES } = require("../models/Expense");

const validateExpense = (req, res, next) => {
  const { amount, category, date } = req.body;

  if (amount === undefined || amount === null || amount === "") {
    return res.status(400).json({ message: "Amount is required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `Invalid category. Valid options: ${CATEGORIES.join(", ")}`,
    });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  // Sanitize
  req.body.amount = parsedAmount;
  req.body.date = parsedDate;

  next();
};

module.exports = { validateExpense };
