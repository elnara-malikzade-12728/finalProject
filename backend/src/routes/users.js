const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
} = require("../controllers/userController");

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Cari istifadəçinin profilini əldə et
 *     description: Daxil olmuş istifadəçinin profil məlumatlarını qaytarır.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cari istifadəçinin profil məlumatları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: İstifadəçi tapılmadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: İstifadəçi tapılmadı.
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", auth, getProfile);

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cari istifadəçinin profilini yenilə
 *     description: Daxil olmuş istifadəçiyə aid bir və ya bir neçə profil sahəsini yeniləyir.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Demo İstifadəçi
 *               email:
 *                 type: string
 *                 format: email
 *                 example: demo@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: yeniDemo123
 *               education:
 *                 type: string
 *                 nullable: true
 *                 example: Bakı Dövlət Universiteti
 *               location:
 *                 type: string
 *                 nullable: true
 *                 example: Bakı
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 example: Frontend proqramlaşdırma ilə maraqlanıram.
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Frontend, UI/UX]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [HTML, CSS, JavaScript]
 *     responses:
 *       200:
 *         description: İstifadəçi profili uğurla yeniləndi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/me", auth, updateProfile);

module.exports = router;
