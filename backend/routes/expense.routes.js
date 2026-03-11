const express = require("express");
const router  = express.Router();

const {
  createExpense, getExpenses, updateExpense,
  deleteExpense, getCategorySummary, getMonthlySpending, exportCSV,
} = require("../controllers/expense.controller");

const { protect }   = require("../middleware/auth.middleware");
const validate      = require("../middleware/validate");
const { expenseSchema, updateExpenseSchema } = require("../validators/expense.validator");

// All routes protected
router.use(protect);

router.get( "/summary", getCategorySummary);
router.get( "/monthly", getMonthlySpending);
router.get( "/export",  exportCSV);

router.route("/")
  .get(getExpenses)
  .post(validate(expenseSchema), createExpense);

router.route("/:id")
  .put(validate(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

module.exports = router;
