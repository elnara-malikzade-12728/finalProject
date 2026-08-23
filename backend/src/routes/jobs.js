const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listJobs,
  getJobById,
} = require("../controllers/jobController");
const {
  applyToJob,
} = require("../controllers/applicationController");

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

/**
 * @openapi
 * /api/jobs/{id}/apply:
 *   post:
 *     tags:
 *       - Applications
 *     summary: Vakansiyaya müraciət et
 *     description: Giriş etmiş istifadəçi üçün yeni vakansiya müraciəti yaradır.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Vakansiya identifikatoru
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       201:
 *         description: Müraciət uğurla yaradıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       401:
 *         description: Autentifikasiya tələb olunur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vakansiya tapılmadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: İstifadəçi bu vakansiyaya artıq müraciət edib
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/apply", auth, applyToJob);
router.get("/:id", getJobById);

module.exports = router;
