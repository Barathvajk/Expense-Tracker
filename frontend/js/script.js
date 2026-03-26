// ── Guard ──────────────────────────────────────────────────────────────────
const token = localStorage.getItem("token");
if (!token) window.location.href = "/pages/login.html";

// ── State ──────────────────────────────────────────────────────────────────
let editingId    = null;
let expenses     = [];
let expenseChart = null;
let monthlyChart = null;
let currentPage  = 1;
const ITEMS_PER_PAGE = 8;

// ── User greeting ──────────────────────────────────────────────────────────
const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
if (storedUser.name) {
  document.getElementById("welcomeMsg").textContent = `Welcome, ${storedUser.name}`;
}
if (storedUser.monthlyBudget) {
  document.getElementById("budgetInput").value = storedUser.monthlyBudget;
}

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = `toast ${type}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

// ── Form error ─────────────────────────────────────────────────────────────
function showFormError(msg) {
  const el = document.getElementById("formError");
  el.textContent = msg;
  el.classList.remove("hidden");
}
function clearFormError() {
  document.getElementById("formError").classList.add("hidden");
}

// ── Add / Update ───────────────────────────────────────────────────────────
async function addExpenses(amount, category, description, date) {
  clearFormError();

  if (!amount || Number(amount) <= 0) return showFormError("Enter a valid amount");
  if (!category)    return showFormError("Select a category");
  if (!description) return showFormError("Enter a description");
  if (!date)        return showFormError("Select a date");

  // ⚠️ Keys kept identical to your original schema: amount, category, description, date
  const body = { amount: Number(amount), category, description, date };

  try {
    if (editingId) {
      await api.put(`/expenses/${editingId}`, body);
      showToast("Expense updated ✓");
    } else {
      await api.post("/expenses", body);
      showToast("Expense added ✓");
    }
    cancelEdit();
    currentPage = 1;
    fetchExpenses();
  } catch (err) {
    showFormError(err.message || "Error saving expense");
  }
}

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchExpenses() {
  try {
    const data = await api.get("/expenses");
    // API returns array directly via service layer
    expenses = Array.isArray(data) ? data : [];
    filterExpenses();
    loadMonthlyChart();
  } catch (err) {
    showToast("Failed to load expenses", "error");
  }
}

// ── Filter ─────────────────────────────────────────────────────────────────
function filterExpenses() {
  let filtered = [...expenses];

  const category = document.getElementById("filterCategory").value;
  const search   = document.getElementById("searchInput").value.toLowerCase().trim();
  const month    = document.getElementById("monthFilter").value;

  if (category !== "all") {
    filtered = filtered.filter(e => e.category === category);
  }
  if (search) {
    filtered = filtered.filter(e =>
      (e.description || "").toLowerCase().includes(search)
    );
  }
  if (month) {
    filtered = filtered.filter(e => e.date && e.date.slice(0, 7) === month);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  updateSummaryCards(filtered);
  updateBudgetBar();
  renderAnalytics(filtered);
  renderChart(filtered);
  showExpenses(filtered);
}

// ── Summary cards ──────────────────────────────────────────────────────────
function updateSummaryCards(filtered) {
  const nowMonth = new Date().toISOString().slice(0, 7);
  const monthTotal    = expenses.filter(e => e.date && e.date.slice(0, 7) === nowMonth).reduce((s, e) => s + Number(e.amount), 0);
  const filteredTotal = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const avg = filtered.length ? filteredTotal / filtered.length : 0;

  document.getElementById("cardMonthTotal").textContent    = "₹" + monthTotal.toFixed(0);
  document.getElementById("cardFilteredTotal").textContent = "₹" + filteredTotal.toFixed(0);
  document.getElementById("cardCount").textContent         = filtered.length;
  document.getElementById("cardAvg").textContent           = "₹" + avg.toFixed(0);
}

// ── Budget bar ─────────────────────────────────────────────────────────────
function updateBudgetBar() {
  const budget   = Number(document.getElementById("budgetInput").value) || 0;
  const nowMonth = new Date().toISOString().slice(0, 7);
  const spent    = expenses.filter(e => e.date && e.date.slice(0, 7) === nowMonth).reduce((s, e) => s + Number(e.amount), 0);
  const pct      = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const bar     = document.getElementById("budgetBar");
  bar.style.width = pct + "%";
  bar.className   = "budget-bar" + (pct >= 100 ? " over" : pct >= 80 ? " warn" : "");

  document.getElementById("budgetSpent").textContent     = `Spent: ₹${spent.toFixed(0)}`;
  document.getElementById("budgetRemaining").textContent = budget > 0
    ? `Remaining: ₹${Math.max(budget - spent, 0).toFixed(0)}`
    : "Set a budget above";
}

// ── Save budget ────────────────────────────────────────────────────────────
async function saveBudget() {
  const monthlyBudget = Number(document.getElementById("budgetInput").value);
  if (monthlyBudget < 0) return showToast("Invalid budget", "error");
  try {
    await api.put("/auth/budget", { monthlyBudget });
    showToast("Budget saved ✓");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.monthlyBudget = monthlyBudget;
    localStorage.setItem("user", JSON.stringify(user));
    updateBudgetBar();
  } catch (err) {
    showToast("Error saving budget", "error");
  }
}

// ── Render expense rows ────────────────────────────────────────────────────
function showExpenses(data) {
  const list = document.getElementById("expensesList");
  document.getElementById("listCount").textContent = `${data.length} item${data.length !== 1 ? "s" : ""}`;

  if (data.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="icon">🧾</div><p>No expenses found</p></div>`;
    document.getElementById("pageNumber").textContent = "Page 1";
    return;
  }

  const start     = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = data.slice(start, start + ITEMS_PER_PAGE);

  list.innerHTML = paginated.map(exp => {
    // ⚠️ Keys: _id, amount, category, description, date — same as your original Expense model
    const date = exp.date ? exp.date.split("T")[0] : "-";
    return `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-title">${escHtml(exp.description || "—")}</div>
          <div class="expense-meta">${date}</div>
        </div>
        <span class="cat-badge">${exp.category}</span>
        <span class="expense-amount">₹${Number(exp.amount).toLocaleString("en-IN")}</span>
        <div class="expense-actions">
          <button class="btn-edit"   onclick='startEdit(${JSON.stringify(exp)})'>Edit</button>
          <button class="btn-delete" onclick="deleteExpense('${exp._id}')">Delete</button>
        </div>
      </div>`;
  }).join("");

  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  document.getElementById("pageNumber").textContent = `Page ${currentPage} of ${totalPages}`;
}

function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Delete ─────────────────────────────────────────────────────────────────
async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  try {
    await api.delete(`/expenses/${id}`);
    showToast("Expense deleted");
    currentPage = 1;
    fetchExpenses();
  } catch (err) {
    showToast("Error deleting", "error");
  }
}

// ── Edit ───────────────────────────────────────────────────────────────────
function startEdit(exp) {
  // ⚠️ Using exact keys: amount, category, description, date
  document.getElementById("amount").value   = exp.amount;
  document.getElementById("category").value = exp.category;
  document.getElementById("note").value     = exp.description || "";
  document.getElementById("date").value     = exp.date ? exp.date.split("T")[0] : "";

  editingId = exp._id;
  document.getElementById("addBtn").textContent   = "Update Expense";
  document.getElementById("formTitle").textContent = "Edit Expense";
  document.getElementById("cancelBtn").classList.remove("hidden");
  document.getElementById("amount").scrollIntoView({ behavior: "smooth", block: "center" });
}

function cancelEdit() {
  editingId = null;
  clearInputs();
  document.getElementById("addBtn").textContent    = "Add Expense";
  document.getElementById("formTitle").textContent = "Add Expense";
  document.getElementById("cancelBtn").classList.add("hidden");
  clearFormError();
}

function clearInputs() {
  ["amount","category","note","date"].forEach(id => document.getElementById(id).value = "");
}

function clearFilters() {
  document.getElementById("searchInput").value    = "";
  document.getElementById("filterCategory").value = "all";
  document.getElementById("monthFilter").value    = "";
  currentPage = 1;
  filterExpenses();
}

// ── Category doughnut chart ────────────────────────────────────────────────
function renderChart(data) {
  const catMap = {};
  data.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount); });

  const labels = Object.keys(catMap);
  const values = Object.values(catMap);
  const COLORS  = ["#38bdf8","#818cf8","#34d399","#fb923c","#f472b6","#a78bfa","#4ade80","#facc15","#60a5fa"];

  const ctx = document.getElementById("expenseChart");
  if (expenseChart) expenseChart.destroy();
  if (!labels.length) return;

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values, backgroundColor: COLORS, borderWidth: 0 }] },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, padding: 10 } },
        tooltip: { callbacks: { label: ctx => ` ₹${ctx.parsed.toLocaleString("en-IN")}` } },
      },
      cutout: "65%",
    },
  });
}

// ── Monthly bar chart ──────────────────────────────────────────────────────
async function loadMonthlyChart() {
  try {
    const data   = await api.get("/expenses/monthly");
    const labels = data.map(d => d.month);
    const totals = data.map(d => d.total);

    const ctx = document.getElementById("monthlyChart");
    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Monthly Spending",
          data: totals,
          backgroundColor: "rgba(56,189,248,0.25)",
          borderColor: "#38bdf8",
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ₹${ctx.parsed.y.toLocaleString("en-IN")}` } },
        },
        scales: {
          x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
          y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
        },
      },
    });
  } catch (err) {
    console.error("Monthly chart error:", err);
  }
}

// ── Analytics breakdown ────────────────────────────────────────────────────
function renderAnalytics(data) {
  const catMap = {};
  data.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount); });
  const total  = Object.values(catMap).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const el     = document.getElementById("analyticsData");

  if (!sorted.length) {
    el.innerHTML = `<p style="color:#475569;font-size:13px">No data to show</p>`;
    return;
  }
  el.innerHTML = sorted.map(([cat, amt]) => {
    const pct = total > 0 ? ((amt / total) * 100).toFixed(0) : 0;
    return `
      <div class="analytics-item">
        <div class="cat-name">${cat}</div>
        <div class="cat-amount">₹${amt.toLocaleString("en-IN")}</div>
        <div class="cat-bar-wrap"><div class="cat-bar" style="width:${pct}%"></div></div>
      </div>`;
  }).join("");
}

// ── CSV Export ─────────────────────────────────────────────────────────────
async function exportCSV() {
  try {
    await api.download("/expenses/export", `expenses_${new Date().toISOString().split("T")[0]}.csv`);
    showToast("CSV exported ✓");
  } catch (err) {
    showToast("Export error", "error");
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
}

// ── Event Listeners ────────────────────────────────────────────────────────
document.getElementById("addBtn").addEventListener("click", () => {
  addExpenses(
    document.getElementById("amount").value,
    document.getElementById("category").value,
    document.getElementById("note").value,
    document.getElementById("date").value
  );
});

document.getElementById("filterCategory").addEventListener("change", () => { currentPage = 1; filterExpenses(); });
document.getElementById("searchInput").addEventListener("input",     () => { currentPage = 1; filterExpenses(); });
document.getElementById("monthFilter").addEventListener("change",    () => { currentPage = 1; filterExpenses(); });

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(expenses.length / ITEMS_PER_PAGE));
  if (currentPage < totalPages) { currentPage++; filterExpenses(); }
});
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) { currentPage--; filterExpenses(); }
});

// ── Init ───────────────────────────────────────────────────────────────────
window.onload = () => {
  fetchExpenses();
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
};
