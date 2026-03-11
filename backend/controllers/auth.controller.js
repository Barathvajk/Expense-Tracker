const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/ApiResponse");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, "Account created successfully", result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, 200, "Login successful", result);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res) => {
  const { _id: id, name, email, monthlyBudget } = req.user;
  sendSuccess(res, 200, "Profile fetched", { id, name, email, monthlyBudget });
};

const updateBudget = async (req, res, next) => {
  try {
    const result = await authService.updateBudget(req.user._id, req.body.monthlyBudget);
    sendSuccess(res, 200, "Budget updated", result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateBudget };
