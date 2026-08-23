const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require(
  "../middleware/requireAdmin",
);
const {
  createLessonUploadUrl,
  completeLessonVideoUpload,
  getLessonVideoUrl,
  deleteLessonVideo,
} = require("../controllers/videoController");

const router = express.Router();

/**
 * @openapi
 * /api/lessons/{lessonId}/video/upload-url:
 *   post:
 *     tags: [Videos]
 *     summary: İmzalanmış video yükləmə URL-i yarat
 *     description: Qısa müddətli Supabase yükləmə məlumatları yaradır. Administrator icazəsi tələb olunur.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
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
 *             required: [contentType, sizeBytes]
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [video/mp4, video/webm, video/quicktime]
 *                 example: video/mp4
 *               sizeBytes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 52428800
 *                 example: 4938271
 *     responses:
 *       201:
 *         description: İmzalanmış yükləmə məlumatları yaradıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUploadCredentials'
 *       400:
 *         description: Dərs identifikatoru, MIME növü və ya fayl ölçüsü yanlışdır
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Dərs tapılmadı
 *       413:
 *         description: Video təyin edilmiş ölçü limitini keçir
 *       500:
 *         description: Verilənlər bazası və ya fayl yaddaşı xətası
 */
router.post(
  "/:lessonId/video/upload-url",
  auth,
  requireAdmin,
  createLessonUploadUrl,
);

/**
 * @openapi
 * /api/lessons/{lessonId}/video/complete:
 *   post:
 *     tags: [Videos]
 *     summary: Dərs videosunun yüklənməsini tamamla
 *     description: Yüklənmiş obyektin mövcudluğunu təsdiqləyir və metadata məlumatlarını dərsdə saxlayır. Administrator icazəsi tələb olunur.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
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
 *             required: [path, contentType, sizeBytes]
 *             properties:
 *               path:
 *                 type: string
 *                 example: courses/1/modules/1/lessons/1/550e8400-e29b-41d4-a716-446655440000.mp4
 *               contentType:
 *                 type: string
 *                 enum: [video/mp4, video/webm, video/quicktime]
 *               sizeBytes:
 *                 type: integer
 *                 example: 4938271
 *               durationSeconds:
 *                 type: integer
 *                 nullable: true
 *                 example: 185
 *     responses:
 *       200:
 *         description: Video metadata məlumatları dərsdə saxlanıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonVideo'
 *       400:
 *         description: Metadata yanlışdır, fayl yolu uyğun deyil və ya obyekt tapılmadı
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Dərs tapılmadı
 *       500:
 *         description: Verilənlər bazası və ya fayl yaddaşı xətası
 */
router.post(
  "/:lessonId/video/complete",
  auth,
  requireAdmin,
  completeLessonVideoUpload,
);

/**
 * @openapi
 * /api/lessons/{lessonId}/video:
 *   get:
 *     tags: [Videos]
 *     summary: Dərs videosu üçün imzalanmış URL əldə et
 *     description: Administratorlar bütün dərs videolarına baxa bilər. Adi istifadəçi əlaqəli kursa qeydiyyatdan keçməli, dərs isə yayımlanmış olmalıdır.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Müvəqqəti imzalanmış video izləmə URL-i
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoAccess'
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *       403:
 *         description: Kurs qeydiyyatı tələb olunur və ya dərs yayımlanmayıb
 *       404:
 *         description: Dərs və ya video tapılmadı
 *       500:
 *         description: Verilənlər bazası və ya fayl yaddaşı xətası
 *   delete:
 *     tags: [Videos]
 *     summary: Dərs videosunu sil
 *     description: Videonu şəxsi fayl yaddaşından silir və dərsin video metadata məlumatlarını təmizləyir. Administrator icazəsi tələb olunur.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       204:
 *         description: Video uğurla silindi
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *       403:
 *         description: Administrator icazəsi tələb olunur
 *       404:
 *         description: Dərs və ya video tapılmadı
 *       500:
 *         description: Verilənlər bazası və ya fayl yaddaşı xətası
 */
router.get(
  "/:lessonId/video",
  auth,
  getLessonVideoUrl,
);

router.delete(
  "/:lessonId/video",
  auth,
  requireAdmin,
  deleteLessonVideo,
);

module.exports = router;
