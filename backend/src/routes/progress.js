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
 *     summary: İnkişaf addımının vəziyyətini yarat və ya yenilə
 *     description: Daxil olmuş istifadəçi üçün inkişaf addımını tamamlanmış və ya tamamlanmamış kimi qeyd edir.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stepId
 *         required: true
 *         description: İnkişaf addımının identifikatoru
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
 *         description: İrəliləyiş uğurla yadda saxlanıldı
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
 *         description: completed sahəsi daxil edilməyib və ya boolean tipində deyil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
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
router.put("/:stepId", auth, upsertProgress);

module.exports = router;