const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getMyApplications,
  getApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const router = express.Router();

router.get("/me", auth, getMyApplications);
router.get("/", auth, requireAdmin, getApplications);
router.patch(
  "/:id/status",
  auth,
  requireAdmin,
  updateApplicationStatus,
);

module.exports = router;
