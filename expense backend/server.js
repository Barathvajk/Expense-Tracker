const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");

app.use(express.json());
app.use(cors());

const mongoURL = "mongodb://127.0.0.1:27017/expensesDB";

mongoose.connect(mongoURL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

const expenseSchema = new mongoose.Schema({
    amount: Number,
    category: String,
    note: String,
    date: String
});

const Expense = mongoose.model("Expense", expenseSchema);

const expensesRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expensesRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000/api/expenses");
});