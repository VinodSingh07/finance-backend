const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const allow = require("../middlewares/roleGuard");
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/record.controller");

// All routes require authentication
router.use(auth);

// ┌─────────────────────────────────────────────────────────────┐
// │  Method  │  Route          │  Access                        │
// ├──────────┼─────────────────┼────────────────────────────────┤
// │  POST    │  /              │  Admin only                    │
// │  GET     │  /              │  Viewer, Analyst, Admin        │
// │  GET     │  /:id           │  Viewer, Analyst, Admin        │
// │  PUT     │  /:id           │  Admin only                    │
// │  DELETE  │  /:id           │  Admin only                    │
// └─────────────────────────────────────────────────────────────┘

router.post("/", allow("admin"), createRecord);
router.get("/", allow("viewer", "analyst", "admin"), getAllRecords);
router.get("/:id", allow("viewer", "analyst", "admin"), getRecordById);
router.put("/:id", allow("admin"), updateRecord);
router.delete("/:id", allow("admin"), deleteRecord);

module.exports = router;
