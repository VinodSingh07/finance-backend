const FinancialRecord = require("../models/financialRecord.model");

// ─── Summary: Total Income, Expenses, Net Balance ─────────────────────────────
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Convert array to readable object
  const summary = { totalIncome: 0, totalExpenses: 0, netBalance: 0 };

  result.forEach((item) => {
    if (item._id === "income") summary.totalIncome = item.total;
    if (item._id === "expense") summary.totalExpenses = item.total;
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;

  return summary;
};

// ─── Category Wise Totals ─────────────────────────────────────────────────────
const getCategoryTotals = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } }, // highest first
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

// ─── Monthly Trends ───────────────────────────────────────────────────────────
const getMonthlyTrends = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } }, // most recent first
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        type: "$_id.type",
        total: 1,
        count: 1,
      },
    },
  ]);

  return result;
};

// ─── Recent Activity ──────────────────────────────────────────────────────────
const getRecentActivity = async (limit = 10) => {
  const records = await FinancialRecord.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email role");

  return records;
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
};
