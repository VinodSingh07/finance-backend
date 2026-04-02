const dashboardService = require("../services/dashboard.service");

// GET /api/dashboard/summary
// Analyst, Admin
const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/by-category
// Analyst, Admin
const getCategoryTotals = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryTotals();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/trends
// Analyst, Admin
const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/recent
// All roles
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default 10, configurable
    const data = await dashboardService.getRecentActivity(limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
};
