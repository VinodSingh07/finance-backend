const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const allow = require("../middlewares/roleGuard");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/user.controller");

// All routes require authentication + Admin only
router.use(auth, allow("admin"));

// ┌──────────────────────────────────────────────────────────────────┐
// │  Method  │  Route          │  Access                            │
// ├──────────┼─────────────────┼────────────────────────────────────┤
// │  GET     │  /              │  Admin only                        │
// │  GET     │  /:id           │  Admin only                        │
// │  POST    │  /              │  Admin only                        │
// │  PATCH   │  /:id/role      │  Admin only                        │
// │  PATCH   │  /:id/status    │  Admin only                        │
// └──────────────────────────────────────────────────────────────────┘

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
