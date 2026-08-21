const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require(
  "../middleware/requireAdmin",
);
const {
  createLessonUploadUrl,
  completeLessonVideoUpload,
  getLessonVideoUrl,
  deleteLessonVideo,
} = require("../controllers/videoController");

const router = express.Router();

router.post(
  "/:lessonId/video/upload-url",
  auth,
  requireAdmin,
  createLessonUploadUrl,
);

router.post(
  "/:lessonId/video/complete",
  auth,
  requireAdmin,
  completeLessonVideoUpload,
);

router.get(
  "/:lessonId/video",
  auth,
  getLessonVideoUrl,
);

router.delete(
  "/:lessonId/video",
  auth,
  requireAdmin,
  deleteLessonVideo,
);

module.exports = router;