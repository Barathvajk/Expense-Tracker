const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, "Email already registered");

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
    },
  };
};

const updateBudget = async (userId, monthlyBudget) => {
  if (monthlyBudget < 0) throw new ApiError(400, "Budget cannot be negative");

  const user = await User.findByIdAndUpdate(
    userId,
    { monthlyBudget },
    { new: true, select: "-password" }
  );

  return { monthlyBudget: user.monthlyBudget };
};

module.exports = { register, login, updateBudget };
