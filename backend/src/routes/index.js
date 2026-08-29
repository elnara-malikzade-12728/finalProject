const express = require("express");

const authRoutes = require("./auth");
const careerRoutes = require("./careers");
const jobRoutes = require("./jobs");
const applicationRoutes = require("./applications");
const progressRoutes = require("./progress");
const userRoutes = require("./users");
const videoRoutes = require("./videos");
const courseRoutes = require("./courses");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/careers", careerRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/progress", progressRoutes);
router.use("/lessons", videoRoutes);
router.use("/courses", courseRoutes);

module.exports = router;
