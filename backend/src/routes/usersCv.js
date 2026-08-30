const express = require("express");
const auth = require("../middleware/auth");
const { generateCvUploadUrl, completeCvUpload, getMyCv, deleteMyCv } = require("../services/cvStorageService");
const prisma = require("../lib/prisma");

const router = express.Router();

async function attachUser(req, res, next) {
    try {
        req.prismaUser = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!req.prismaUser) {
            return res.status(404).json({ error: "İstifadəçi tapılmadı." });
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

/**
 * @openapi
 * /api/users/me/cv/upload-url:
 *   post:
 *     tags: [CV Management]
 *     summary: CV üçün xüsusi yükləmə URL-i yaradın
 *     description: CV faylı yalnız PDF, DOC və DOCX formatında, 5 MB-dan böyük olmadan yüklənə bilər.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, contentType, fileSizeBytes]
 *             properties:
 *               fileName: { type: string, example: "cv.pdf" }
 *               contentType: { type: string, example: "application/pdf" }
 *               fileSizeBytes: { type: integer, example: 320000 }
 *     responses:
 *       200: { description: Yükləmə URL-i yaradıldı }
 *       400: { description: Fayl formatı və ya ölçüsü düzgün deyil }
 */
router.post("/me/cv/upload-url", auth, attachUser, async (req, res, next) => {
    try {
        const result = await generateCvUploadUrl(req);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /api/users/me/cv/complete:
 *   post:
 *     tags: [CV Management]
 *     summary: CV yükləməsini tamamla
 *     description: Yüklənmiş CV-nin fayl yolu profil məlumatına yazılır.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path, fileName]
 *             properties:
 *               path: { type: string }
 *               fileName: { type: string }
 *               contentType: { type: string }
 *     responses:
 *       200: { description: CV təsdiqləndi }
 */
router.post("/me/cv/complete", auth, attachUser, async (req, res, next) => {
    try {
        const result = await completeCvUpload(req);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /api/users/me/cv:
 *   get:
 *     tags: [CV Management]
 *     summary: Mənim CV-mi göstər
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CV məlumatı }
 */
router.get("/me/cv", auth, attachUser, async (req, res, next) => {
    try {
        const cv = await getMyCv(req);
        return res.status(200).json({ cv });
    } catch (error) {
        return next(error);
    }
});

/**
 * @openapi
 * /api/users/me/cv:
 *   delete:
 *     tags: [CV Management]
 *     summary: CV-ni sil
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CV silindi }
 */
router.delete("/me/cv", auth, attachUser, async (req, res, next) => {
    try {
        const result = await deleteMyCv(req);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
