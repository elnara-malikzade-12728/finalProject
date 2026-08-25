const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  loginLimiter,
  registerLimiter,
} = require("../middleware/rateLimiters");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Yeni istifadəçi qeydiyyatı
 *     description: Yeni hesab yaradır və JWT giriş tokeni qaytarır.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
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
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: Demo1234
 *     responses:
 *       201:
 *         description: İstifadəçi uğurla qeydiyyatdan keçdi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT giriş tokeni
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ad, e-poçt ünvanı və şifrə daxil edilməyib
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Ad, e-poçt ünvanı və şifrə mütləq daxil edilməlidir.
 *       409:
 *         description: E-poçt ünvanı artıq istifadə olunur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Bu e-poçt ünvanı artıq qeydiyyatdan keçib.
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", registerLimiter, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sistemə giriş
 *     description: İstifadəçi məlumatlarını yoxlayır və JWT giriş tokeni qaytarır.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: demo@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 maxLength: 72
 *                 example: Demo1234
 *     responses:
 *       200:
 *         description: Giriş uğurla tamamlandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT giriş tokeni
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: E-poçt ünvanı və ya şifrə daxil edilməyib
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: E-poçt ünvanı və şifrə mütləq daxil edilməlidir.
 *       401:
 *         description: E-poçt ünvanı və ya şifrə yanlışdır
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: E-poçt ünvanı və ya şifrə yanlışdır.
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", loginLimiter, login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Sistemdən təhlükəsiz çıxış
 *     description: Cari istifadəçinin mövcud JWT tokenlərini etibarsız edir.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Çıxış uğurla tamamlandı
 *       401:
 *         description: Autentifikasiya tokeni yoxdur və ya yanlışdır
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 */
router.post("/logout", auth, logout);

module.exports = router;
