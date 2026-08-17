const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  upsertProgress,
} = require("../controllers/progressController");

/**
 * @openapi
 * /api/progress/{stepId}:
 *   put:
 *     tags:
 *       - Progress
 *     summary: Create or update roadmap progress
 *     description: Marks a roadmap step as completed or incomplete for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         description: Roadmap step identifier
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
 *             required:
 *               - completed
 *             properties:
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Progress saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 stepId:
 *                   type: integer
 *                   example: 1
 *                 completed:
 *                   type: boolean
 *                   example: true
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: The completed field is missing or is not boolean
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:stepId", auth, upsertProgress);

module.exports = router;