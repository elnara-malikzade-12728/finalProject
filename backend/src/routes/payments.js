const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createCheckout,
  handleWebhook,
  getMyPayments,
} = require("../controllers/paymentController");

/**
 * @openapi
 * /api/payments/checkout:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Checkout sessiyası yarat (plan və ya tək kurs üçün)
 *     description: Frontend yalnız planId və ya courseId göndərir. Qiymət backend tərəfindən müəyyən edilir.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId: { type: integer }
 *               courseId: { type: integer }
 *     responses:
 *       200:
 *         description: Ödəniş səhifəsinin keçidi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string }
 *       400: { description: Yanlış sorğu }
 *       401: { description: Autentifikasiya tələb olunur }
 *       404: { description: Plan və ya kurs tapılmadı }
 */
router.post("/checkout", auth, createCheckout);

/**
 * @openapi
 * /api/payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Stripe webhook (yalnız Stripe tərəfindən çağırılır)
 *     description: İmza yoxlanılır, idempotent şəkildə emal olunur. İstifadəçi tərəfindən birbaşa çağırılmamalıdır.
 *     responses:
 *       200: { description: Event qəbul edildi }
 *       400: { description: İmza yanlışdır }
 */
router.post("/webhook", handleWebhook);

/**
 * @openapi
 * /api/payments/me:
 *   get:
 *     tags:
 *       - Payments
 *     summary: İstifadəçinin öz ödəniş tarixçəsi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Ödənişlərin siyahısı }
 *       401: { description: Autentifikasiya tələb olunur }
 */
router.get("/me", auth, getMyPayments);

module.exports = router;