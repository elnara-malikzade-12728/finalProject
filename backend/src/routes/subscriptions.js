const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getMySubscription,
  cancelMySubscription,
  listAllSubscriptions,
  listAllPayments,
} = require("../controllers/subscriptionController");

/**
 * @openapi
 * /api/subscriptions/me:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: İstifadəçinin öz abunəliyi
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Abunəlik məlumatı (yoxdursa null) }
 *       401: { description: Autentifikasiya tələb olunur }
 */
router.get("/subscriptions/me", auth, getMySubscription);

/**
 * @openapi
 * /api/subscriptions/me/cancel:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Aktiv abunəliyi ləğv et
 *     description: Abunəlik ödənilmiş müddət bitənə qədər aktiv qalır.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Abunəlik ləğv edildi }
 *       401: { description: Autentifikasiya tələb olunur }
 *       404: { description: Aktiv abunəlik tapılmadı }
 */
router.post("/subscriptions/me/cancel", auth, cancelMySubscription);

/**
 * @openapi
 * /api/admin/subscriptions:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Bütün abunəliklərin siyahısı (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Abunəliklərin siyahısı }
 *       401: { description: Autentifikasiya tələb olunur }
 *       403: { description: Administrator icazəsi tələb olunur }
 */
router.get("/admin/subscriptions", auth, requireAdmin, listAllSubscriptions);

/**
 * @openapi
 * /api/admin/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Bütün ödənişlərin siyahısı (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Ödənişlərin siyahısı }
 *       401: { description: Autentifikasiya tələb olunur }
 *       403: { description: Administrator icazəsi tələb olunur }
 */
router.get("/admin/payments", auth, requireAdmin, listAllPayments);

module.exports = router;