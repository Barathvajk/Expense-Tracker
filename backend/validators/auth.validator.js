const Joi = require("joi");

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email:    Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const budgetSchema = Joi.object({
  monthlyBudget: Joi.number().min(0).required(),
});

module.exports = { registerSchema, loginSchema, budgetSchema };
