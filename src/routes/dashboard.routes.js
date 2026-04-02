const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const allow = require("../middlewares/roleGuard");
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
} = require("../controllers/dashboard.controller");

// All routes require authentication
router.use(auth);

// ┌──────────────────────────────────────────────────────────────────┐
// │  Method  │  Route          │  Access                            │
// ├──────────┼─────────────────┼────────────────────────────────────┤
// │  GET     │  /summary       │  Analyst, Admin                    │
// │  GET     │  /by-category   │  Analyst, Admin                    │
// │  GET     │  /trends        │  Analyst, Admin                    │
// │  GET     │  /recent        │  Viewer, Analyst, Admin            │
// └──────────────────────────────────────────────────────────────────┘

router.get("/summary", allow("analyst", "admin"), getSummary);
router.get("/by-category", allow("analyst", "admin"), getCategoryTotals);
router.get("/trends", allow("analyst", "admin"), getMonthlyTrends);
router.get("/recent", allow("viewer", "analyst", "admin"), getRecentActivity);

module.exports = router;
