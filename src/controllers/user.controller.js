const User = require("../models/user.model");

// ─── Get All Users ────────────────────────────────────────────────────────────
// GET /api/users
// Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    // Build filter dynamically
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// ─── Get Single User ──────────────────────────────────────────────────────────
// GET /api/users/:id
// Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user ID format" });
    }
    next(error);
  }
};

// ─── Create User ──────────────────────────────────────────────────────────────
// POST /api/users
// Admin only — admin creates accounts for others
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages });
    }
    next(error);
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
// PATCH /api/users/:id/role
// Admin only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res
        .status(400)
        .json({ success: false, error: "role is required" });
    }

    if (!["viewer", "analyst", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "role must be one of: viewer, analyst, admin",
      });
    }

    // Prevent admin from changing their own role accidentally
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user ID format" });
    }
    next(error);
  }
};

// ─── Update User Status ───────────────────────────────────────────────────────
// PATCH /api/users/:id/status
// Admin only
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: "isActive is required (true or false)",
      });
    }

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, error: "isActive must be a boolean" });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot change your own account status",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
      returnDocument: "after",
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user ID format" });
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
};
