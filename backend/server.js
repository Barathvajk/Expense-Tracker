const result = require("dotenv").config();
console.log("dotenv result:", result);
console.log("MONGO_URI:", process.env.MONGO_URI);

require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const path        = require("path");

const connectDB   = require("./config/db");
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require("./config/constants");

const authRoutes    = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Allow inline scripts in frontend
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// ── Auth-specific stricter rate limit (prevent brute force) ─────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── General Middleware ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Serve Frontend ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/expenses", expenseRoutes);

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running", env: process.env.NODE_ENV });
});

// ── Frontend Fallback ───────────────────────────────────────────────────────
app.get("*splat", (req, res) => {
  const file = req.path.endsWith(".html")
    ? path.join(__dirname, "../frontend/pages", path.basename(req.path))
    : path.join(__dirname, "../frontend/pages/login.html");
  res.sendFile(file);
});

// ── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});