const express = require("express");
const router = express.Router();
const {
  register,
  login,
} = require("../controllers/authController");

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
 *                 example: demo123
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
router.post("/register", register);

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
 *                 example: demo123
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
router.post("/login", login);

module.exports = router;