# 💰 Expense Management System — Pro Edition

A production-grade personal expense tracker built with **HTML/CSS/JS + Node.js + Express + MongoDB + JWT**.

---

## 📁 Project Structure

```
expense-management-system/
│
├── backend/
│   ├── config/
│   │   ├── db.js               ← MongoDB connection
│   │   └── constants.js        ← Shared constants (categories, limits)
│   │
│   ├── controllers/
│   │   ├── auth.controller.js  ← Thin: calls service, sends response
│   │   └── expense.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js  ← JWT protect middleware
│   │   ├── error.middleware.js ← Global error handler
│   │   └── validate.js         ← Joi validation middleware
│   │
│   ├── models/
│   │   ├── User.js             ← User schema (bcrypt, budget)
│   │   └── Expense.js          ← Expense schema (same keys as original)
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── expense.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js     ← All auth business logic
│   │   └── expense.service.js  ← All expense business logic
│   │
│   ├── utils/
│   │   ├── ApiError.js         ← Custom error class
│   │   ├── ApiResponse.js      ← Consistent { success, message, data }
│   │   └── generateToken.js    ← JWT token generator
│   │
│   ├── validators/
│   │   ├── auth.validator.js   ← Joi schemas for auth
│   │   └── expense.validator.js← Joi schemas for expenses
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js               ← Entry point
│
└── frontend/
    ├── css/
    │   ├── auth.css            ← Login/Register styles
    │   └── style.css           ← Dashboard styles
    │
    ├── js/
    │   ├── api.js              ← Central fetch helper (all API calls)
    │   ├── auth.js             ← Login/Register logic
    │   └── script.js           ← Dashboard logic
    │
    └── pages/
        ├── login.html
        ├── register.html
        └── index.html          ← Main dashboard
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### 4. Open in browser
```
http://localhost:3000/pages/login.html
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| POST   | /api/auth/register    | ❌   | Register user      |
| POST   | /api/auth/login       | ❌   | Login user         |
| GET    | /api/auth/profile     | ✅   | Get profile        |
| PUT    | /api/auth/budget      | ✅   | Update budget      |

### Expenses
| Method | Endpoint                    | Auth | Description         |
|--------|-----------------------------|------|---------------------|
| GET    | /api/expenses               | ✅   | Get all expenses    |
| POST   | /api/expenses               | ✅   | Create expense      |
| PUT    | /api/expenses/:id           | ✅   | Update expense      |
| DELETE | /api/expenses/:id           | ✅   | Delete expense      |
| GET    | /api/expenses/summary       | ✅   | Category totals     |
| GET    | /api/expenses/monthly       | ✅   | Monthly breakdown   |
| GET    | /api/expenses/export        | ✅   | Download CSV        |

---

## ✅ Pro Features Added

- **Layered Architecture**: Routes → Controllers → Services → Models
- **Joi Validation**: Input validated before hitting controllers
- **Global Error Handler**: All errors handled in one place
- **Custom ApiError**: Consistent error throwing across services
- **Consistent Responses**: `{ success, message, data }` on every endpoint
- **Helmet**: HTTP security headers
- **Rate Limiting**: 100 req/15min globally, 20 req/15min on auth routes
- **Morgan**: HTTP request logging in development
- **Centralized API helper** (`api.js`): All frontend fetch calls in one file
- **Token expiry handling**: Auto-redirect to login on 401
- **Budget saved to DB**: Persists across sessions
- **No key changes**: All MongoDB field names preserved exactly

---

## 📦 Dependencies

```json
{
  "bcryptjs":           "password hashing",
  "cors":               "cross-origin requests",
  "dotenv":             "environment variables",
  "express":            "web framework",
  "express-rate-limit": "brute-force protection",
  "helmet":             "security headers",
  "joi":                "input validation",
  "jsonwebtoken":       "JWT auth",
  "mongoose":           "MongoDB ODM",
  "morgan":             "request logging"
}
```
