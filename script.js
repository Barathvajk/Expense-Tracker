let editingId = null;

let expenses = [];

function addExpenses(amount, category, note, date) {

    if (amount <= 0 || category === "" || note === "" || date === "") {
        alert("please fill all required fields correctly");
        return;
    }

    if (editingId  !== null) {
        //Update existing expense data
        for(let i = 0; i<expenses.length; i++)
        {
            if (expenses[i].id === editingId) {
                expenses[i].amount = Number(amount);
                expenses[i].category = category;
                expenses[i].note = note;
                expenses[i].date = date;
                break;
            }
        }

        editingId = null;
        document.getElementById("addBtn").textContent = "Add Expense";
    } else {
        //Add new expense
        let expense = {
            id : Date.now(),
            amount: Number(amount),
            category,
            note,
            date
        };
        expenses.push(expense);
    }
}

function showExpenses(){
    let list = document.getElementById("expensesList");
    list.innerHTML = "";

    for(let i=0;i<expenses.length;i++){
        let item = document.createElement("div");

        let text = document.createElement("span");
        text.textContent = expenses[i].amount + " | " + expenses[i].category + " | " + expenses[i].note + " | " + expenses[i].date;

        let delBtn = document.createElement("button");
        delBtn.textContent = "Delete";

        delBtn.onclick = function () {
            deleteExpense(expenses[i].id);
        }

        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";

        editBtn.onclick = function() {
            startEdit(expenses[i]);
        }

        item.appendChild(text);
        item.appendChild(delBtn);
        item.appendChild(editBtn);
        list.appendChild(item);
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    showExpenses();
    calculateTotal();
}

function startEdit(expense) {
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("note").value = expense.note;
    document.getElementById("date").value = expense.date;

    editingId = expense.id;

    document.getElementById("addBtn").textContent = "Update Expense";

}

function calculateTotal() {
    let total = 0;

    for (let i = 0; i < expenses.length; i++)
    {
        total += expenses[i].amount;
    }

    document.getElementById("total").textContent = "Total: ₹" + total;

}

document.getElementById("addBtn").addEventListener("click",function(){

    let amount = document.getElementById("amount").value;
    let category = document.getElementById("category").value;
    let note = document.getElementById("note").value;
    let date = document.getElementById("date").value;

    addExpenses(amount, category, note, date);
    showExpenses();
    calculateTotal();

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("date").value = "";

});
