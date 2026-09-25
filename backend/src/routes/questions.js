const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { updateQuestion, deleteQuestion } = require("../controllers/questionController");

const router = express.Router();

/**
 * @openapi
 * /api/questions/{id}:
 *   patch:
 *     tags: [Questions]
 *     summary: Sualı yenilə
 *     description: Sualın mətni, variantlar, düzgün cavab və sırası dəyişdirilir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Sual yeniləndi }
 *       404: { description: Sual tapılmadı }
 */
router.patch("/:id", auth, requireRole("ADMIN"), updateQuestion);

/**
 * @openapi
 * /api/questions/{id}:
 *   delete:
 *     tags: [Questions]
 *     summary: Sualı sil
 *     description: Sual, testdən silinərək bağlı cavablar da avtomatik təmizlənir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Sual silindi }
 *       404: { description: Sual tapılmadı }
 */
router.delete("/:id", auth, requireRole("ADMIN"), deleteQuestion);

module.exports = router;
