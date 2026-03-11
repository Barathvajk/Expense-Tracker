const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided. Please log in.", 401));
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Your session has expired. Please log in again.", 401));
      }
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    // 3. Check user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };