const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getMonthlySpending
} = require("../controllers/expenseController");

router.use(protect);

router.get("/summary", getExpenseSummary);
router.get("/monthly", getMonthlySpending);

router.post("/", createExpense);
router.get("/", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;