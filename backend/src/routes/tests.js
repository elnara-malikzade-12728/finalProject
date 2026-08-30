const express = require("express");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const requireRole = require("../middleware/requireRole");
const { createTest, listTests, listPublishedTests, getTest, updateTest, deleteTest, publishTest } = require("../controllers/testController");
const { createQuestion, reorderQuestions } = require("../controllers/questionController");

const router = express.Router();

/**
 * @openapi
 * /api/tests/published:
 *   get:
 *     tags: [Tests]
 *     summary: Yayımlanmış testləri əldə et
 *     description: İstifadəçilər üçün əlçatan dərs və yekun testlərini qaytarır.
 *     responses:
 *       200: { description: Yayımlanmış testlər qaytarıldı }
 */
router.get("/published", listPublishedTests);

/**
 * @openapi
 * /api/tests:
 *   get:
 *     tags: [Tests]
 *     summary: Bütün testləri idarəetmə üçün əldə et
 *     description: Administrator üçün testlər, bağlı kurs və ya dərs, sual və cəhd sayları ilə qaytarılır.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Test siyahısı qaytarıldı }
 *       403: { description: Yalnız administratorlar üçün icazə var }
 */
router.get("/", auth, requireRole("ADMIN"), listTests);

/**
 * @openapi
 * /api/tests:
 *   post:
 *     tags: [Tests]
 *     summary: Yeni test yaradın
 *     description: Administrator tərəfindən test yaradılır. Test ya lesson, ya da course final imtahanına aid ola bilər.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, lessonId]
 *             properties:
 *               title: { type: string, example: "Lesson 3 Quiz" }
 *               type: { type: string, enum: [LESSON, FINAL], example: LESSON }
 *               lessonId: { type: integer, nullable: true, example: 12 }
 *               courseId: { type: integer, nullable: true, example: 5 }
 *               passScorePercent: { type: integer, example: 60 }
 *               timeLimitMinutes: { type: integer, example: 15 }
 *               published: { type: boolean, example: false }
 *     responses:
 *       201: { description: Test uğurla yaradıldı }
 *       400: { description: Daxil edilmiş məlumatlar düzgün deyil }
 *       403: { description: Yalnız administratorlar üçün icazə var }
 */
router.post("/", auth, requireRole("ADMIN"), createTest);

/**
 * @openapi
 * /api/tests/{id}:
 *   get:
 *     tags: [Tests]
 *     summary: Test məlumatını əldə et
 *     description: Adminlər testin doğru cavablarını görür, digər istifadəçilər yalnız yayımlanmış testin ümumi məlumatını görür.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Test məlumatı qaytarıldı }
 *       403: { description: Test yayımlanmayıb }
 *       404: { description: Test tapılmadı }
 */
router.get("/:id", optionalAuth, getTest);

/**
 * @openapi
 * /api/tests/{id}:
 *   patch:
 *     tags: [Tests]
 *     summary: Test məlumatını yenilə
 *     description: Administrator tərəfindən testin başlığı, tipi, keçid faizi və vaxt limiti yenilənir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Test yeniləndi }
 *       400: { description: Məlumatlar düzgün deyil }
 *       403: { description: Yalnız administratorlar üçün icazə var }
 */
router.patch("/:id", auth, requireRole("ADMIN"), updateTest);

/**
 * @openapi
 * /api/tests/{id}:
 *   delete:
 *     tags: [Tests]
 *     summary: Testi sil
 *     description: Test və ona bağlı suallar silinir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Test silindi }
 *       404: { description: Test tapılmadı }
 */
router.delete("/:id", auth, requireRole("ADMIN"), deleteTest);

/**
 * @openapi
 * /api/tests/{id}/publish:
 *   patch:
 *     tags: [Tests]
 *     summary: Testin yayımlanma statusunu dəyişdir
 *     description: Testin göstərilməsi açıq/bağlı vəziyyətə keçir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               published: { type: boolean, example: true }
 *     responses:
 *       200: { description: Test statusu yeniləndi }
 *       403: { description: Yalnız administratorlar üçün icazə var }
 */
router.patch("/:id/publish", auth, requireRole("ADMIN"), publishTest);

/**
 * @openapi
 * /api/tests/{id}/questions:
 *   post:
 *     tags: [Questions]
 *     summary: Testə sual əlavə et
 *     description: Testə yeni sual əlavə olunur. Lesson testləri 3–5, final testləri 20–30 sual aralığında olmalıdır.
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
 *             required: [questionText, options, correctValue, order]
 *             properties:
 *               questionText: { type: string, example: "CSS-də Flexbox hansı vəziyyəti yaradır?" }
 *               options: { type: array, items: { type: string }, example: ["Düz layout", "Yanal layout", "Sürətli animasiya", "Hər ikisi"] }
 *               correctValue: { type: [string, number, boolean], example: 1 }
 *               order: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Sual uğurla əlavə edildi }
 *       400: { description: Sual forması düzgün deyil }
 */
router.post("/:id/questions", auth, requireRole("ADMIN"), createQuestion);

/**
 * @openapi
 * /api/tests/{id}/questions/reorder:
 *   put:
 *     tags: [Questions]
 *     summary: Sual sıralamasını dəyişdir
 *     description: Testin bütün suallarının yeni ardıcıllığı id siyahısı ilə yenilənir.
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
 *             type: array
 *             items: { type: integer }
 *             example: [5, 2, 1, 3, 4]
 *     responses:
 *       200: { description: Sıralama uğurla yeniləndi }
 *       400: { description: Sıralama siyahısı düzgün deyil }
 */
router.put("/:id/questions/reorder", auth, requireRole("ADMIN"), reorderQuestions);

module.exports = router;
