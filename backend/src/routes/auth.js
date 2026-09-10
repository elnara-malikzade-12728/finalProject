const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
  getVerificationStatus,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  loginLimiter,
  registerLimiter,
  accountRecoveryLimiter,
} = require("../middleware/rateLimiters");

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Yeni istifadəçi qeydiyyatı
 *     description: Yeni hesab yaradır və e-poçt təsdiq keçidi göndərir. Hesab təsdiqlənənədək giriş bağlıdır.
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
 *       202:
 *         description: Qeydiyyat sorğusu qəbul edildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 verificationStatusToken:
 *                   type: string
 *                   description: Qeydiyyat səhifəsində e-poçt təsdiqinin başqa cihazda tamamlandığını yoxlamaq üçün qısaömürlü, məhdud token.
 *       400:
 *         description: Ad, e-poçt ünvanı və şifrə daxil edilməyib
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Ad, e-poçt ünvanı və şifrə mütləq daxil edilməlidir.
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
 *       403:
 *         description: Hesabın e-poçt ünvanı təsdiqlənməyib
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
 * /api/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: E-poçt ünvanını təsdiqlə
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: E-poçt ünvanı təsdiqləndi }
 *       400: { description: Keçid yanlışdır və ya vaxtı bitib }
 * /api/auth/verification-status:
 *   post:
 *     tags: [Authentication]
 *     summary: Qeydiyyat sessiyasının e-poçt təsdiqi statusunu yoxla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statusToken]
 *             properties:
 *               statusToken: { type: string }
 *     responses:
 *       200: { description: Təsdiq statusu qaytarıldı; təsdiqlənibsə giriş sessiyası yaradıldı }
 *       400: { description: Status tokeni yanlışdır və ya vaxtı bitib }
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Təsdiq məktubunu yenidən göndər
 *     description: Hesabın mövcudluğunu açıqlamayan ümumi cavab qaytarır.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Sorğu qəbul edildi }
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Şifrə yeniləmə keçidi istə
 *     description: Hesabın mövcudluğunu açıqlamayan ümumi cavab qaytarır.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Sorğu qəbul edildi }
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Şifrəni yenilə
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, format: password, minLength: 8, maxLength: 72 }
 *     responses:
 *       200: { description: Şifrə yeniləndi və əvvəlki sessiyalar ləğv edildi }
 *       400: { description: Token və ya şifrə yanlışdır, yaxud yeni şifrə əvvəlki ilə eynidir }
 */
router.post("/verify-email", accountRecoveryLimiter, verifyEmail);
router.post("/verification-status", getVerificationStatus);
router.post("/resend-verification", accountRecoveryLimiter, resendVerification);
router.post("/forgot-password", accountRecoveryLimiter, forgotPassword);
router.post("/reset-password", accountRecoveryLimiter, resetPassword);

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
