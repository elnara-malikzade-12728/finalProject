const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
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
 *     description: İctimai endpoint-dir. Vakansiyaları əlaqəli kurs məlumatları ilə birlikdə səhifələnmiş şəkildə qaytarır.
 *     parameters:
 *       - in: query
 *         name: employmentType
 *         schema: { type: string, enum: [FULL_TIME, PART_TIME, INTERNSHIP] }
 *         description: İş növünə görə filtr
 *       - in: query
 *         name: experienceLevel
 *         schema: { type: string, enum: [ENTRY_LEVEL, JUNIOR, MID_LEVEL, SENIOR] }
 *         description: Təcrübə səviyyəsinə görə filtr
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
 * /api/jobs:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Yeni vakansiya yarat
 *     description: Administrator yeni vakansiya yaradır.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       201:
 *         description: Vakansiya uğurla yaradıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Daxil edilmiş məlumatlar yanlışdır
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Seçilmiş kurs tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 */
router.post("/", auth, requireAdmin, createJob);

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
 *       403:
 *         description: Administrator vakansiyaya müraciət edə bilməz
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

/**
 * @openapi
 * /api/jobs/{id}:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Vakansiyanın məlumatlarını göstər
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Vakansiya məlumatları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Vakansiya tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *   patch:
 *     tags:
 *       - Jobs
 *     summary: Vakansiyanı yenilə
 *     description: Administrator vakansiyanın bir və ya bir neçə sahəsini yeniləyir.
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
 *             allOf:
 *               - $ref: '#/components/schemas/JobInput'
 *             description: Bütün sahələr istəyə bağlıdır, lakin ən azı bir sahə göndərilməlidir.
 *     responses:
 *       200:
 *         description: Vakansiya uğurla yeniləndi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Daxil edilmiş məlumatlar yanlışdır
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Vakansiya və ya peşə tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *   delete:
 *     tags:
 *       - Jobs
 *     summary: Vakansiyanı sil
 *     description: Administrator vakansiyanı və ona aid müraciətləri silir.
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
 *         description: Vakansiya uğurla silindi
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Vakansiya tapılmadı
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 */
router.get("/:id", getJobById);
router.patch("/:id", auth, requireAdmin, updateJob);
router.delete("/:id", auth, requireAdmin, deleteJob);

module.exports = router;
