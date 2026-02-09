const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: { type: String, required: true },
    date: { type: String, required: true }
});

// Use existing model if already compiled
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

module.exports = Expense;