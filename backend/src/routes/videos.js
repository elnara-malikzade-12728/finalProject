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

/**
 * @openapi
 * /api/lessons/{lessonId}/video/upload-url:
 *   post:
 *     tags: [Videos]
 *     summary: Create a signed video upload URL
 *     description: Creates short-lived Supabase upload credentials. Administrator access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentType, sizeBytes]
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [video/mp4, video/webm, video/quicktime]
 *                 example: video/mp4
 *               sizeBytes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 52428800
 *                 example: 4938271
 *     responses:
 *       201:
 *         description: Signed upload credentials created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUploadCredentials'
 *       400:
 *         description: Invalid lesson identifier, MIME type or file size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Lesson not found
 *       413:
 *         description: Video exceeds the configured size limit
 *       500:
 *         description: Database or storage error
 */
router.post(
  "/:lessonId/video/upload-url",
  auth,
  requireAdmin,
  createLessonUploadUrl,
);

/**
 * @openapi
 * /api/lessons/{lessonId}/video/complete:
 *   post:
 *     tags: [Videos]
 *     summary: Complete a lesson video upload
 *     description: Confirms that the uploaded object exists and stores its metadata on the lesson. Administrator access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path, contentType, sizeBytes]
 *             properties:
 *               path:
 *                 type: string
 *                 example: courses/1/modules/1/lessons/1/550e8400-e29b-41d4-a716-446655440000.mp4
 *               contentType:
 *                 type: string
 *                 enum: [video/mp4, video/webm, video/quicktime]
 *               sizeBytes:
 *                 type: integer
 *                 example: 4938271
 *               durationSeconds:
 *                 type: integer
 *                 nullable: true
 *                 example: 185
 *     responses:
 *       200:
 *         description: Video metadata saved on the lesson
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonVideo'
 *       400:
 *         description: Invalid metadata, mismatched path or object not found
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Database or storage error
 */
router.post(
  "/:lessonId/video/complete",
  auth,
  requireAdmin,
  completeLessonVideoUpload,
);

/**
 * @openapi
 * /api/lessons/{lessonId}/video:
 *   get:
 *     tags: [Videos]
 *     summary: Get a signed lesson video URL
 *     description: Administrators may view every lesson video. Regular users must be enrolled in the related course, and the lesson must be published.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Temporary signed playback URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoAccess'
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Course enrollment required or lesson not published
 *       404:
 *         description: Lesson or video not found
 *       500:
 *         description: Database or storage error
 *   delete:
 *     tags: [Videos]
 *     summary: Delete a lesson video
 *     description: Removes the object from private storage and clears the lesson video metadata. Administrator access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       204:
 *         description: Video deleted successfully
 *       401:
 *         description: Missing or invalid authentication token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Lesson or video not found
 *       500:
 *         description: Database or storage error
 */
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
