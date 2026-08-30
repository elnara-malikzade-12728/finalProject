const express = require("express");
const auth = require("../middleware/auth");
const { startTestAttempt, getAttempt, submitAttempt, listMyAttempts } = require("../controllers/attemptController");

const router = express.Router();

/**
 * @openapi
 * /api/tests/{id}/attempts:
 *   post:
 *     tags: [Attempts]
 *     summary: Test cəhdini başlat
 *     description: İstifadəçi üçün yeni test cədi yaradır. Yalnız yayımlanmış test üçün icazə verilir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Test cəhdı yaradıldı }
 *       403: { description: Test yayımlanmayıb və ya administrator cəhd başlada bilməz }
 *       404: { description: Test tapılmadı }
 */
router.post("/tests/:id/attempts", auth, startTestAttempt);

/**
 * @openapi
 * /api/attempts/{id}:
 *   get:
 *     tags: [Attempts]
 *     summary: Cəhd məlumatını göstər
 *     description: İstifadəçi yalnız öz cəhdinə, admin isə istənilən cəhdə baxa bilər. Düzgün cavablar hələ submit olunmayanda göstərilmir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cəhd məlumatı }
 *       403: { description: Bu cəhdə baxma icazəniz yoxdur }
 *       404: { description: Cəhd tapılmadı }
 */
router.get("/attempts/:id", auth, getAttempt);

/**
 * @openapi
 * /api/attempts/{id}/submit:
 *   post:
 *     tags: [Attempts]
 *     summary: Cəhdin cavablarını göndər
 *     description: Serverdə bal hesablanır, vaxt limiti yoxlanılır, pass/fail vəziyyəti müəyyən edilir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId, answer]
 *                   properties:
 *                     questionId: { type: integer }
 *                     answer: { type: [string, number, boolean, array, object, null] }
 *     responses:
 *       200: { description: Cəhd uğurla göndərildi }
 *       400: { description: Cavablar düzgün deyil və ya vaxt limiti bitib }
 *       409: { description: Cəhd artıq göndərilib }
 */
router.post("/attempts/:id/submit", auth, submitAttempt);

/**
 * @openapi
 * /api/attempts/me:
 *   get:
 *     tags: [Attempts]
 *     summary: Mənim cəhdlərimi göstər
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: İstifadəçinin cəhdləri }
 */
router.get("/attempts/me", auth, listMyAttempts);

module.exports = router;
