# Finance Dashboard Backend

## 🚀 Live API
Base URL: https://finance-backend-44ak.onrender.com

> Note: This is hosted on Render's free tier. If the API takes 30-50 seconds to respond on the first request, that is normal — the server spins down after inactivity and needs a moment to wake up.

A role-based finance data processing and access control backend built with Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer          | Choice                 |
| -------------- | ---------------------- |
| Runtime        | Node.js                |
| Framework      | Express.js             |
| Database       | MongoDB (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens)  |
| Password Hash  | bcryptjs               |
| Environment    | dotenv                 |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, get me
│   │   ├── record.controller.js     # Financial records CRUD
│   │   ├── dashboard.controller.js  # Dashboard summary APIs
│   │   └── user.controller.js       # User management
│   ├── middlewares/
│   │   ├── auth.js                  # JWT verification
│   │   └── roleGuard.js             # Role-based access control
│   ├── models/
│   │   ├── user.model.js            # User schema
│   │   └── financialRecord.model.js # Financial record schema
│   ├── routes/
│   │   ├── auth.routes.js           # Auth routes
│   │   ├── record.routes.js         # Record routes
│   │   ├── dashboard.routes.js      # Dashboard routes
│   │   └── user.routes.js           # User routes
│   ├── services/
│   │   └── dashboard.service.js     # MongoDB aggregation logic
│   └── utils/
│       └── generateToken.js         # JWT token generator
├── .env
├── server.js
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/VinodSingh07/finance-backend
cd finance-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance-dashboard
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=60d
NODE_ENV=development
```

### 4. Run the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## Roles and Permissions

| Action                   | Viewer | Analyst | Admin |
| ------------------------ | ------ | ------- | ----- |
| Register / Login         | ✅     | ✅      | ✅    |
| View financial records   | ✅     | ✅      | ✅    |
| View recent activity     | ✅     | ✅      | ✅    |
| Access dashboard summary | ❌     | ✅      | ✅    |
| Access category totals   | ❌     | ✅      | ✅    |
| Access monthly trends    | ❌     | ✅      | ✅    |
| Create financial records | ❌     | ❌      | ✅    |
| Update financial records | ❌     | ❌      | ✅    |
| Delete financial records | ❌     | ❌      | ✅    |
| Manage users             | ❌     | ❌      | ✅    |

---

## API Reference

All protected routes require this header:

```
Authorization: Bearer <token>
```

---

### Auth Routes — `/api/auth`

#### Register

```
POST /api/auth/register
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "admin"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

---

#### Login

```
POST /api/auth/login
```

Body:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

---

#### Get Current User — 🔒 Protected

```
GET /api/auth/me
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "..."
  }
}
```

---

### Financial Record Routes — `/api/records`

#### Create Record — 🔒 Admin only

```
POST /api/records
```

Body:

```json
{
  "amount": 50000,
  "type": "income",
  "category": "salary",
  "date": "2024-01-05",
  "notes": "January salary"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Record created successfully",
  "data": { "_id": "...", "amount": 50000, "type": "income", "category": "salary", ... }
}
```

---

#### Get All Records — 🔒 All roles

```
GET /api/records
```

Query Parameters (all optional):

| Param      | Type   | Example      | Description        |
| ---------- | ------ | ------------ | ------------------ |
| `type`     | string | `income`     | Filter by type     |
| `category` | string | `salary`     | Filter by category |
| `from`     | date   | `2024-01-01` | Filter from date   |
| `to`       | date   | `2024-12-31` | Filter to date     |
| `page`     | number | `1`          | Page number        |
| `limit`    | number | `10`         | Records per page   |

Response `200`:

```json
{
  "success": true,
  "data": {
    "records": [...],
    "pagination": { "total": 20, "page": 1, "limit": 10, "totalPages": 2 }
  }
}
```

---

#### Get Single Record — 🔒 All roles

```
GET /api/records/:id
```

Response `200`:

```json
{
  "success": true,
  "data": { "_id": "...", "amount": 50000, "type": "income", "category": "salary", ... }
}
```

---

#### Update Record — 🔒 Admin only

```
PUT /api/records/:id
```

Body (all fields optional):

```json
{
  "amount": 55000,
  "notes": "Updated salary"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": { ... }
}
```

---

#### Delete Record — 🔒 Admin only

```
DELETE /api/records/:id
```

Response `200`:

```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

### Dashboard Routes — `/api/dashboard`

#### Summary — 🔒 Analyst, Admin

```
GET /api/dashboard/summary
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "totalIncome": 90000,
    "totalExpenses": 23000,
    "netBalance": 67000
  }
}
```

---

#### Category Totals — 🔒 Analyst, Admin

```
GET /api/dashboard/by-category
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "category": "salary", "type": "income", "total": 75000, "count": 2 },
    { "category": "rent", "type": "expense", "total": 12000, "count": 1 }
  ]
}
```

---

#### Monthly Trends — 🔒 Analyst, Admin

```
GET /api/dashboard/trends
```

Response `200`:

```json
{
  "success": true,
  "data": [
    { "year": 2024, "month": 3, "type": "income", "total": 25000, "count": 1 },
    { "year": 2024, "month": 2, "type": "income", "total": 15000, "count": 1 },
    { "year": 2024, "month": 1, "type": "expense", "total": 12000, "count": 1 }
  ]
}
```

---

#### Recent Activity — 🔒 All roles

```
GET /api/dashboard/recent?limit=5
```

Response `200`:

```json
{
  "success": true,
  "data": [ ... last N records with user info populated ... ]
}
```

---

### User Management Routes — `/api/users` — 🔒 Admin only

#### Get All Users

```
GET /api/users
```

Query Parameters (all optional):

| Param      | Type    | Example  | Description             |
| ---------- | ------- | -------- | ----------------------- |
| `role`     | string  | `viewer` | Filter by role          |
| `isActive` | boolean | `true`   | Filter by active status |
| `page`     | number  | `1`      | Page number             |
| `limit`    | number  | `10`     | Users per page          |

---

#### Get Single User

```
GET /api/users/:id
```

---

#### Create User

```
POST /api/users
```

Body:

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "123456",
  "role": "analyst"
}
```

---

#### Update User Role

```
PATCH /api/users/:id/role
```

Body:

```json
{
  "role": "viewer"
}
```

---

#### Update User Status

```
PATCH /api/users/:id/status
```

Body:

```json
{
  "isActive": false
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

| Status Code | Meaning                         |
| ----------- | ------------------------------- |
| `400`       | Bad request / validation error  |
| `401`       | Unauthenticated / invalid token |
| `403`       | Forbidden / insufficient role   |
| `404`       | Resource not found              |
| `409`       | Conflict (e.g. duplicate email) |
| `500`       | Internal server error           |

---

## Assumptions Made

1. **Admin creates user accounts** — while self-registration is supported, in a real dashboard system an admin would provision accounts. The `/api/users` POST endpoint handles this.
2. **Soft delete on records** — financial records are never permanently removed. A `isDeleted: true` flag is set instead, preserving audit history.
3. **Role embedded on User** — roles are stored as a string field on the User document rather than a separate collection, which is appropriate for a fixed small set of roles.
4. **Passwords never returned** — the password field has `select: false` on the schema so it is excluded from every query response automatically.
5. **Token carries role** — the JWT payload includes both `id` and `role` so the role guard middleware does not need a DB call on every request.
6. **Admin self-protection** — an admin cannot deactivate their own account or change their own role, preventing accidental lockout.

---

## Tradeoffs Considered

| Decision                                   | Tradeoff                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Embedded roles vs separate Role collection | Simpler for a fixed role set; a separate collection would be needed for dynamic permissions |
| JWT stateless auth vs sessions             | JWTs are simpler to implement and scale; sessions would allow instant token revocation      |
| Soft delete vs hard delete                 | Preserves data integrity and audit trail; requires `isDeleted` filter on every query        |
| MongoDB aggregations in service layer      | Keeps controllers thin and business logic testable in isolation                             |
| Pagination capped at 100                   | Prevents accidental large data dumps that could slow the server                             |
