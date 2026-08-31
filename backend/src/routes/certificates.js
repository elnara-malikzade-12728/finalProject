const express = require("express");
const auth = require("../middleware/auth");
const { getMyCertificates, verifyCertificate, downloadCertificate } = require("../controllers/certificateController");

const router = express.Router();

/**
 * @openapi
 * /api/certificates/me:
 *   get:
 *     tags: [Certificates]
 *     summary: Mənim sertifikatlarımı göstər
 *     description: İstifadəçinin əldə etdiyi sertifikatların siyahısı qaytarılır.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Sertifikat siyahısı }
 */
router.get("/me", auth, getMyCertificates);

/**
 * @openapi
 * /api/certificates/{code}/verify:
 *   get:
 *     tags: [Certificates]
 *     summary: Sertifikatın etibarlılığını yoxla
 *     description: Açıq endpoint. Sertifikatın kodu əsasında istifadəçi və kurs məlumatı qaytarılır.
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Sertifikat etibarlıdır }
 *       404: { description: Sertifikat tapılmadı }
 */
router.get("/:code/verify", verifyCertificate);

/**
 * @openapi
 * /api/certificates/{id}/download:
 *   get:
 *     tags: [Certificates]
 *     summary: Sertifikatın PDF-ni yüklə
 *     description: Yalnız sertifikat sahibi və ya adminə icazə verilir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: QR kodlu PDF sertifikat
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 *       403: { description: Bu sertifikatə baxma icazəniz yoxdur }
 *       404: { description: Sertifikat tapılmadı }
 */
router.get("/:id/download", auth, downloadCertificate);

module.exports = router;
