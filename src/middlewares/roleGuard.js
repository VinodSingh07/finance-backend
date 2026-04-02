// Usage: allow("admin")  or  allow("admin", "analyst")
// Always chain AFTER auth middleware: router.post("/", auth, allow("admin"), controller)

const allow = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Means auth middleware was skipped — defensive check
      return res.status(401).json({
        success: false,
        error: "Not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = allow;
