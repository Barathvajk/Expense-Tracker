const AppError = require("../utils/AppError");

// Handle Mongoose CastError (invalid ObjectId)
const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Handle Mongoose duplicate key error
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 400);
};

// Handle Mongoose validation error
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400);
};

// Handle expired JWT
const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

// Handle invalid JWT
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error("💥 ERROR:", err);
  }

  // Transform known Mongoose/JWT errors into AppErrors
  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (err.name === "JsonWebTokenError") error = handleJWTError();

  // Operational error: trusted, send to client
  if (error.isOperational || err.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Unknown error: don't leak details in production
  console.error("UNEXPECTED ERROR:", err);
  res.status(500).json({
    status: "error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
};

module.exports = errorHandler;
