const ApiError = require("../utils/ApiError");

// Handle Mongoose CastError (invalid ObjectId)
const handleCastError = (err) => new ApiError(400, `Invalid ${err.path}: ${err.value}`);

// Handle Mongoose duplicate key error
const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new ApiError(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new ApiError(400, messages.join(", "));
};

// Handle JWT errors
const handleJWTError = () => new ApiError(401, "Invalid token. Please login again.");
const handleJWTExpired = () => new ApiError(401, "Token expired. Please login again.");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError")            error = handleCastError(err);
  if (err.code === 11000)                  error = handleDuplicateKey(err);
  if (err.name === "ValidationError")      error = handleValidationError(err);
  if (err.name === "JsonWebTokenError")    error = handleJWTError();
  if (err.name === "TokenExpiredError")    error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const message    = error.message    || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
