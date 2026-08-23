const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getMyApplications,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

const router = express.Router();

/**
 * @openapi
 * /api/applications/me:
 *   get:
 *     tags:
 *       - Applications
 *     summary: Mənim müraciətlərimi göstər
 *     description: Giriş etmiş istifadəçinin vakansiya müraciətlərini ən yenidən ən köhnəyə qaytarır.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İstifadəçinin müraciət siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       401:
 *         description: Autentifikasiya tələb olunur
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
router.get("/me", auth, getMyApplications);

/**
 * @openapi
 * /api/applications:
 *   get:
 *     tags:
 *       - Applications
 *     summary: Bütün müraciətləri göstər
 *     description: Administrator üçün status və mətn axtarışı ilə müraciət siyahısını qaytarır.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, REVIEWED, ACCEPTED, REJECTED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: İstifadəçi, e-poçt, vakansiya və ya şirkət üzrə axtarış
 *     responses:
 *       200:
 *         description: Müraciət siyahısı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       400:
 *         description: Status yanlışdır
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", auth, requireAdmin, getApplications);

/**
 * @openapi
 * /api/applications/{id}/status:
 *   patch:
 *     tags:
 *       - Applications
 *     summary: Müraciətin statusunu yenilə
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWED, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Yenilənmiş müraciət
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Status yanlışdır
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Müraciət tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 */
router.patch(
  "/:id/status",
  auth,
  requireAdmin,
  updateApplicationStatus,
);

/**
 * @openapi
 * /api/applications/{id}:
 *   delete:
 *     tags:
 *       - Applications
 *     summary: Müraciəti sil
 *     description: Administrator seçilmiş müraciəti silir.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       204:
 *         description: Müraciət silindi
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Müraciət tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 */
router.delete("/:id", auth, requireAdmin, deleteApplication);

module.exports = router;
