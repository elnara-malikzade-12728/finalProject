const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const optionalAuth = require("../middleware/optionalAuth");
const {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

/**
 * @openapi
 * /api/plans:
 *   get:
 *     tags:
 *       - Plans
 *     summary: Abunəlik planlarının siyahısı
 *     description: Adi istifadəçilər yalnız aktiv planları görür. Administrator bütün planları (aktiv və deaktiv) görür.
 *     responses:
 *       200:
 *         description: Planların siyahısı
 *   post:
 *     tags:
 *       - Plans
 *     summary: Yeni plan yarat (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Plan yaradıldı
 *       400:
 *         description: Yanlış məlumat
 *       401:
 *         description: Autentifikasiya tələb olunur
 *       403:
 *         description: Administrator icazəsi tələb olunur
 */
router.get("/", optionalAuth, listPlans);
router.post("/", auth, requireAdmin, createPlan);

/**
 * @openapi
 * /api/plans/{id}:
 *   patch:
 *     tags:
 *       - Plans
 *     summary: Planı yenilə (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Plan yeniləndi }
 *       404: { description: Plan tapılmadı }
 *   delete:
 *     tags:
 *       - Plans
 *     summary: Planı sil (ödənişi olan planlar deaktiv edilir)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Plan silindi }
 *       200: { description: Plan deaktiv edildi (ödənişi olduğu üçün) }
 *       404: { description: Plan tapılmadı }
 */
router.patch("/:id", auth, requireAdmin, updatePlan);
router.delete("/:id", auth, requireAdmin, deletePlan);

module.exports = router;