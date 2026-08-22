const express = require("express");
const router = express.Router();
const {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Bütün vakansiya və təcrübə proqramlarını göstər
 *     description: Bütün vakansiyaları əlaqəli peşə məlumatları ilə birlikdə qaytarır.
 *     responses:
 *       200:
 *         description: Vakansiya və təcrübə proqramlarının siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Job'
 *                   - type: object
 *                     properties:
 *                       career:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: Frontend Developer
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listJobs);
router.get("/:id", getJob);
router.post("/", requireAuth, requireRole("ADMIN"), createJob);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateJob);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteJob);

module.exports = router;