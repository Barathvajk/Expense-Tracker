const Joi = require("joi");
const { CATEGORIES } = require("../config/constants");

const expenseSchema = Joi.object({
  amount:      Joi.number().min(0.01).required().messages({
    "number.min": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  category:    Joi.string().valid(...CATEGORIES).required().messages({
    "any.only": `Category must be one of: ${CATEGORIES.join(", ")}`,
    "any.required": "Category is required",
  }),
  description: Joi.string().allow("").max(200).optional(),
  date:        Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    "string.pattern.base": "Date must be in YYYY-MM-DD format",
    "any.required": "Date is required",
  }),
});

const updateExpenseSchema = expenseSchema.fork(
  ["amount", "category", "date"],
  (field) => field.optional()
);

module.exports = { expenseSchema, updateExpenseSchema };
