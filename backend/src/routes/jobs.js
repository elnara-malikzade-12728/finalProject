const express = require("express");
const router = express.Router();
const {
  listJobs,
} = require("../controllers/jobController");

/**
 * @openapi
 * /api/jobs:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: List all jobs and internships
 *     description: Returns all vacancies with their related career.
 *     responses:
 *       200:
 *         description: Job and internship list
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
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listJobs);

module.exports = router;