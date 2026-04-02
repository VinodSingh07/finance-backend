const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/auth.controller");
const auth = require("../middlewares/auth");

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.get("/me", auth, getMe); // GET  /api/auth/me  (protected)

module.exports = router;
