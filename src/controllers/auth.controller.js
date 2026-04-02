const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

// ─── Register ────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Public — anyone can register, default role is "viewer"
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists",
      });
    }

    // Create user — password hashing happens in the model's pre('save') hook
    const user = await User.create({ name, email, password, role });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    // Mongoose validation errors (e.g. missing required fields, bad email format)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: messages });
    }
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic presence check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Fetch user with password (select: false on schema — must explicitly include it)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Contact an admin.",
      });
    }

    // Compare password using instance method from user model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ──────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Protected — returns the currently logged-in user's info
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
