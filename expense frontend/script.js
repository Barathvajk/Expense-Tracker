let editingId = null;
let expenses = [];

const API_URL = "http://localhost:3000/api/expenses";

// Add or update expense
async function addExpenses(amount, category, note, date) {
    console.log("Sending to backend:", { amount, category, note, date });

    if (amount <= 0 || category === "" || note === "" || date === "") {
        alert("Please fill all required fields correctly");
        return;
    }

    const expense = { amount: Number(amount), category, note, date };

    try {
        if (editingId) {
            // Update expense
            const response = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expense)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Backend error:", text);
                return;
            }

            console.log("Expense updated:", await response.json());
            editingId = null;
            document.getElementById("addBtn").textContent = "Add Expense";
        } else {
            // Add new expense
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expense)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Backend error:", text);
                return;
            }

            console.log("Expense added:", await response.json());
        }

        // Refresh list
        fetchExpenses();

        // Clear inputs
        document.getElementById("amount").value = "";
        document.getElementById("category").value = "";
        document.getElementById("note").value = "";
        document.getElementById("date").value = "";

    } catch (error) {
        console.error("Error adding expense:", error);
    }
}

// Show expenses on UI
function showExpenses(expensesToShow = expenses) {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";

    if (expensesToShow.length === 0) {
        list.textContent = "No expenses found";
        return;
    }

    expensesToShow.forEach(exp => {
        const item = document.createElement("div");
        item.className = "expense-item";

        const text = document.createElement("span");
        text.textContent = `${exp.amount} | ${exp.category} | ${exp.note} | ${exp.date}`;

        const actions = document.createElement("div");
        actions.className = "expense-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => startEdit(exp);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteExpense(exp._id);

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        item.appendChild(text);
        item.appendChild(actions);

        list.appendChild(item);
    });
}

// Fetch expenses from backend
async function fetchExpenses() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        expenses = data;
        showExpenses();
        calculateTotal();
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

// Delete expense
async function deleteExpense(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) {
            console.error("Backend error:", await response.text());
            return;
        }
        console.log("Expense deleted:", await response.json());
        fetchExpenses();
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}

// Edit expense
function startEdit(expense) {
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("note").value = expense.note;
    document.getElementById("date").value = expense.date;

    editingId = expense._id; // MongoDB uses _id
    document.getElementById("addBtn").textContent = "Update Expense";
}

// Filter and search
function filterExpenses() {
    let filteredExpenses = [...expenses];

    const selectedCategory = document.getElementById("filterCategory").value;
    const searchText = document.getElementById("searchInput").value.toLowerCase().trim();

    if (selectedCategory !== "all") {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === selectedCategory);
    }

    if (searchText !== "") {
        filteredExpenses = filteredExpenses.filter(exp => exp.note.toLowerCase().includes(searchText));
    }

    showExpenses(filteredExpenses);
    calculateTotal(filteredExpenses);
}

// Calculate total amount
function calculateTotal(expensesToCalculate = expenses) {
    const total = expensesToCalculate.reduce((sum, exp) => sum + Number(exp.amount), 0);
    document.getElementById("total").textContent = "Total: ₹" + total;
}

// Event listeners
document.getElementById("addBtn").addEventListener("click", () => {
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const note = document.getElementById("note").value;
    const date = document.getElementById("date").value;
    addExpenses(amount, category, note, date);
});

window.onload = function () {
    fetchExpenses();
    document.getElementById("filterCategory").addEventListener("change", filterExpenses);
    document.getElementById("searchInput").addEventListener("input", filterExpenses);
};
