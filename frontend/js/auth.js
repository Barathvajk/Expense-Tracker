// ── Auth page JS (used by login.html and register.html) ──────────────────────

function showError(msg) {
  const el = document.getElementById("errorMsg");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  const ok = document.getElementById("successMsg");
  if (ok) ok.classList.add("hidden");
}

function showSuccess(msg) {
  const el = document.getElementById("successMsg");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  const err = document.getElementById("errorMsg");
  if (err) err.classList.add("hidden");
}

function togglePassword(inputId = "password") {
  const pw = document.getElementById(inputId);
  pw.type = pw.type === "password" ? "text" : "password";
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
async function login() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn      = document.getElementById("loginBtn");

  if (!email || !password) return showError("Please fill all fields");

  btn.textContent = "Signing in...";
  btn.disabled    = true;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login failed");
      btn.textContent = "Sign In";
      btn.disabled    = false;
      return;
    }

    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user",  JSON.stringify(data.data.user));
    window.location.href = "/pages/index.html";

  } catch (err) {
    showError("Network error. Is the server running?");
    btn.textContent = "Sign In";
    btn.disabled    = false;
  }
}

// ── REGISTER ───────────────────────────────────────────────────────────────
async function register() {
  const name            = document.getElementById("name").value.trim();
  const email           = document.getElementById("email").value.trim();
  const password        = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const btn             = document.getElementById("registerBtn");

  if (!name || !email || !password || !confirmPassword) return showError("Please fill all fields");
  if (password.length < 6) return showError("Password must be at least 6 characters");
  if (password !== confirmPassword) return showError("Passwords do not match");

  btn.textContent = "Creating account...";
  btn.disabled    = true;

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Registration failed");
      btn.textContent = "Create Account";
      btn.disabled    = false;
      return;
    }

    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user",  JSON.stringify(data.data.user));
    showSuccess("Account created! Redirecting...");
    setTimeout(() => (window.location.href = "/pages/index.html"), 1000);

  } catch (err) {
    showError("Network error. Is the server running?");
    btn.textContent = "Create Account";
    btn.disabled    = false;
  }
}

// Redirect if already logged in
if (localStorage.getItem("token")) {
  window.location.href = "/pages/index.html";
}

// Allow Enter key to submit
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const loginBtn    = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  if (loginBtn)    login();
  if (registerBtn) register();
});
