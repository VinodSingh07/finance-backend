const FinancialRecord = require("../models/financialRecord.model");

// ─── Create Record ────────────────────────────────────────────────────────────
// POST /api/records
// Admin only
const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Manual validation
    if (!amount || !type || !category) {
      return res.status(400).json({
        success: false,
        error: "amount, type, and category are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "type must be either 'income' or 'expense'",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "amount must be greater than 0",
      });
    }

    const record = await FinancialRecord.create({
      userId: req.user.id, // from auth middleware
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages });
    }
    next(error);
  }
};

// ─── Get All Records ──────────────────────────────────────────────────────────
// GET /api/records
// All roles
// Supports filters: ?type=income&category=salary&from=2024-01-01&to=2024-12-31&page=1&limit=10
const getAllRecords = async (req, res, next) => {
  try {
    const { type, category, from, to, page = 1, limit = 10 } = req.query;

    // Build filter object dynamically based on what query params are provided
    const filter = {};

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          error: "type must be 'income' or 'expense'",
        });
      }
      filter.type = type;
    }

    if (category) {
      // Case-insensitive partial match
      filter.category = { $regex: category, $options: "i" };
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort({ date: -1 }) // newest first
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "name email role"), // join user info
      FinancialRecord.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Record ────────────────────────────────────────────────────────
// GET /api/records/:id
// All roles
const getRecordById = async (req, res, next) => {
  try {
    const record = await FinancialRecord.findById(req.params.id).populate(
      "userId",
      "name email role",
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    // Invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid record ID format" });
    }
    next(error);
  }
};

// ─── Update Record ────────────────────────────────────────────────────────────
// PUT /api/records/:id
// Admin only
const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Validate type if provided
    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "type must be 'income' or 'expense'",
      });
    }

    // Validate amount if provided
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "amount must be greater than 0",
      });
    }

    const record = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date, notes },
      { returnDocument: "after", runValidators: true },
    );

    if (!record) {
      return res
        .status(404)
        .json({ success: false, error: "Record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid record ID format" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages });
    }
    next(error);
  }
};

// ─── Delete Record (Soft Delete) ──────────────────────────────────────────────
// DELETE /api/records/:id
// Admin only
const deleteRecord = async (req, res, next) => {
  try {
    // We set isDeleted: true instead of removing the document
    // The pre('find') hook in the model will auto-exclude it from all future queries
    const record = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { returnDocument: "after" },
    );

    if (!record) {
      return res
        .status(404)
        .json({ success: false, error: "Record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid record ID format" });
    }
    next(error);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
