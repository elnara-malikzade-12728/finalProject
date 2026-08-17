const express = require("express");
const router = express.Router();
const {
  listCareers,
  getCareer,
  getRoadmap,
} = require("../controllers/careerController");

/**
 * @openapi
 * /api/careers:
 *   get:
 *     tags:
 *       - Careers
 *     summary: List all careers
 *     description: Returns the available career paths.
 *     responses:
 *       200:
 *         description: Career list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Career'
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listCareers);

/**
 * @openapi
 * /api/careers/{id}:
 *   get:
 *     tags:
 *       - Careers
 *     summary: Get one career
 *     description: Returns a career with its roadmap steps and related jobs.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Career identifier
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Career details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Career'
 *                 - type: object
 *                   properties:
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           order:
 *                             type: integer
 *                           careerId:
 *                             type: integer
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *       404:
 *         description: Career not found
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
router.get("/:id", getCareer);

/**
 * @openapi
 * /api/careers/{id}/roadmap:
 *   get:
 *     tags:
 *       - Careers
 *     summary: Get a career roadmap
 *     description: Returns the ordered roadmap steps for a career.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Career identifier
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Ordered roadmap steps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: Learn HTML fundamentals
 *                   description:
 *                     type: string
 *                     nullable: true
 *                   order:
 *                     type: integer
 *                     example: 1
 *                   careerId:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/roadmap", getRoadmap);

module.exports = router;