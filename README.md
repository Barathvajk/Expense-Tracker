# 💰 Personal Expense Tracker

A full-stack expense tracking web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Track your spending, set monthly budgets, and visualize your expenses with interactive charts.

🔗 **Live Demo**: [https://personal-finance-tracker-a07d.onrender.com](https://personal-finance-tracker-a07d.onrender.com)

---

## ✨ Features

- **Authentication** — Secure register/login with JWT tokens
- **Expense Management** — Add, edit, and delete expenses
- **16 Categories** — Food & Dining, Transport, Shopping, and more
- **Budget Tracking** — Set monthly budgets with visual progress bar
- **Charts & Analytics** — Doughnut chart by category, monthly trend bar chart
- **Filters & Search** — Filter by category, month, or keyword
- **CSV Export** — Download your expenses as a CSV file
- **Pagination** — Clean paginated expense list
- **Responsive Design** — Works on desktop and mobile

---

## 🛠 Tech Stack

**Frontend**
- HTML, CSS, JavaScript (Vanilla)
- Chart.js

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Joi validation
- Helmet, CORS, Rate Limiting

**Deployment**
- Render (Backend + Frontend)
- MongoDB Atlas (Database)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Barathvajk/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/expensesDB
   JWT_SECRET=your_strong_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
Expense-Tracker/
├── backend/
│   ├── config/         # DB connection, constants
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth, error handling, validation
│   ├── models/         # Mongoose models (User, Expense)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helpers (ApiError, ApiResponse, token)
│   ├── validators/     # Joi validators
│   └── server.js       # Entry point
└── frontend/
    ├── css/            # Stylesheets
    ├── js/             # api.js, auth.js, script.js
    └── pages/          # HTML pages
```

---

## 🔒 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/budget` | Update monthly budget |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/monthly` | Monthly spending data |
| GET | `/api/expenses/export` | Export CSV |

---

## 👨‍💻 Author

**BarathvajK**
- GitHub: [@Barathvajk](https://github.com/Barathvajk)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
