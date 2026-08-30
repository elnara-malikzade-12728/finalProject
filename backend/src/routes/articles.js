const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const optionalAuth = require("../middleware/optionalAuth");
const {
  listPublishedArticles,
  getArticleBySlug,
  listAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");

/**
 * Admin giriş etmişsə bütün məqalələri (draft daxil), yoxsa yalnız
 * yayımlanmış məqalələri qaytarır.
 */
async function listArticles(req, res) {
  if (req.user?.role === "ADMIN") {
    return listAllArticles(req, res);
  }
  return listPublishedArticles(req, res);
}

/**
 * @openapi
 * /api/articles:
 *   get:
 *     tags:
 *       - Articles
 *     summary: Məqalələrin siyahısı
 *     description: İctimai istifadəçilər yalnız yayımlanmış məqalələri görür. Administrator bütün məqalələri (draft daxil) görür.
 *     responses:
 *       200:
 *         description: Məqalələrin siyahısı
 *   post:
 *     tags:
 *       - Articles
 *     summary: Yeni məqalə yarat (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201: { description: Məqalə yaradıldı }
 *       400: { description: Yanlış məlumat }
 *       401: { description: Autentifikasiya tələb olunur }
 *       403: { description: Administrator icazəsi tələb olunur }
 */
router.get("/", optionalAuth, listArticles);
router.post("/", auth, requireAdmin, createArticle);

/**
 * @openapi
 * /api/articles/{slug}:
 *   get:
 *     tags:
 *       - Articles
 *     summary: Məqaləni slug ilə göstər (yalnız yayımlanmış)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Məqalə məlumatları }
 *       404: { description: Məqalə tapılmadı }
 */
router.get("/:slug", getArticleBySlug);

/**
 * @openapi
 * /api/articles/{id}:
 *   patch:
 *     tags:
 *       - Articles
 *     summary: Məqaləni yenilə (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Məqalə yeniləndi }
 *       404: { description: Məqalə tapılmadı }
 *   delete:
 *     tags:
 *       - Articles
 *     summary: Məqaləni sil (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Məqalə silindi }
 *       404: { description: Məqalə tapılmadı }
 */
router.patch("/:id", auth, requireAdmin, updateArticle);
router.delete("/:id", auth, requireAdmin, deleteArticle);

module.exports = router;