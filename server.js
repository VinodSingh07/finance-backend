require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Finance Backend API is running" });
});

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/records", require("./src/routes/record.routes"));
app.use("/api/dashboard", require("./src/routes/dashboard.routes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
