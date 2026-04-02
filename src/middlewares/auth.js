const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check the user still exists and is active
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Token is invalid. User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated.",
      });
    }

    // Attach user info to request — available in all downstream controllers
    req.user = { id: user._id, role: user.role, name: user.name };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          error: "Token has expired. Please log in again.",
        });
    }
    next(error);
  }
};

module.exports = auth;
