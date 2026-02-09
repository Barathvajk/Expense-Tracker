const Expense = require("../models/Expense"); // Your Mongoose model

// GET all expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};

// POST add a new expense
const addExpense = async (req, res) => {
    const { amount, category, note, date } = req.body;

    if (!amount || !category || !note || !date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newExpense = new Expense({ amount, category, note, date });
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        console.error("Add Error:", error);
        res.status(500).json({ message: "Error adding expense" });
    }
};

// PUT update an expense
const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, category, note, date } = req.body;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { amount, category, note, date },
            { new: true } // return updated document
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(updatedExpense);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Error updating expense" });
    }
};

// DELETE an expense
const deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error deleting expense" });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense
};
