let editingId = null;
let expenses = [];

const API_URL = "http://localhost:3000/api/expenses";

const token = localStorage.getItem("token");

// AUTH CHECK
if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}

const authHeader = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
};


// ADD OR UPDATE EXPENSE
async function addExpenses(amount, category, description, date) {

    if (amount <= 0 || category === "" || description === "" || date === "") {
        alert("Please fill all fields");
        return;
    }

    const expense = {
        amount: Number(amount),
        category,
        description,
        date
    };

    try {

        if (editingId) {

            const response = await fetch(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: authHeader,
                body: JSON.stringify(expense)
            });

            await response.json();

            editingId = null;
            document.getElementById("addBtn").textContent = "Add Expense";

        } else {

            const response = await fetch(API_URL, {
                method: "POST",
                headers: authHeader,
                body: JSON.stringify(expense)
            });

            await response.json();
        }

        clearInputs();
        fetchExpenses();

    } catch (error) {
        console.error("Error:", error);
    }
}


// FETCH EXPENSES
async function fetchExpenses() {

    try {

        const response = await fetch(API_URL, {
            headers: authHeader
        });

        const data = await response.json();

        expenses = data;

        showExpenses();
        calculateTotal();

    } catch (error) {
        console.error("Error fetching expenses:", error);
    }

}


// SHOW EXPENSES
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
        text.textContent =
            `${exp.amount} | ${exp.category} | ${exp.description} | ${exp.date}`;

        const actions = document.createElement("div");
        actions.className = "expense-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.onclick = () => startEdit(exp);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => deleteExpense(exp._id);

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        item.appendChild(text);
        item.appendChild(actions);

        list.appendChild(item);

    });

}


// DELETE EXPENSE
async function deleteExpense(id) {

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: authHeader
        });

        fetchExpenses();

    } catch (error) {
        console.error("Error deleting expense:", error);
    }

}


// START EDIT
function startEdit(expense) {

    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("note").value = expense.description;
    document.getElementById("date").value = expense.date;

    editingId = expense._id;

    document.getElementById("addBtn").textContent = "Update Expense";

}


// CALCULATE TOTAL
function calculateTotal(expensesToCalculate = expenses) {

    const total = expensesToCalculate.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0
    );

    document.getElementById("total").textContent = "Total: ₹" + total;

}


// CLEAR INPUTS
function clearInputs() {

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("date").value = "";

}


// ADD BUTTON EVENT
document.getElementById("addBtn").addEventListener("click", () => {

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("note").value;
    const date = document.getElementById("date").value;

    addExpenses(amount, category, description, date);

});

function filterExpenses() {

    let filteredExpenses = [...expenses];

    const selectedCategory = document.getElementById("filterCategory").value;
    const searchText = document.getElementById("searchInput").value.toLowerCase();

    // Filter by category
    if (selectedCategory !== "all") {

        filteredExpenses = filteredExpenses.filter(
            exp => exp.category === selectedCategory
        );

    }

    // Search by description (notes)
    if (searchText !== "") {

        filteredExpenses = filteredExpenses.filter(
            exp => exp.description && exp.description.toLowerCase().includes(searchText)
        );

    }

    showExpenses(filteredExpenses);
    calculateTotal(filteredExpenses);
}


// PAGE LOAD
window.onload = function () {

    fetchExpenses();

    document
        .getElementById("filterCategory")
        .addEventListener("change", filterExpenses);

    document
        .getElementById("searchInput")
        .addEventListener("input", filterExpenses);

};

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}