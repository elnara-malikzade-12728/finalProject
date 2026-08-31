const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} = require("../controllers/corporateInquiryController");

/**
 * @openapi
 * /api/corporate-inquiries:
 *   post:
 *     tags:
 *       - Corporate
 *     summary: Korporativ B2B müraciəti göndər (ictimai)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, contactName, email, message]
 *             properties:
 *               companyName: { type: string }
 *               contactName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               employeeCount: { type: integer }
 *               message: { type: string }
 *     responses:
 *       201: { description: Müraciət qəbul edildi }
 *       400: { description: Yanlış məlumat }
 *   get:
 *     tags:
 *       - Corporate
 *     summary: Bütün müraciətlərin siyahısı (yalnız administrator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [NEW, CONTACTED, CLOSED] }
 *         description: Statusa görə filtr
 *     responses:
 *       200: { description: Müraciətlərin siyahısı }
 *       401: { description: Autentifikasiya tələb olunur }
 *       403: { description: Administrator icazəsi tələb olunur }
 */
router.post("/", createInquiry);
router.get("/", auth, requireAdmin, listInquiries);

/**
 * @openapi
 * /api/corporate-inquiries/{id}/status:
 *   patch:
 *     tags:
 *       - Corporate
 *     summary: Müraciətin statusunu dəyiş (yalnız administrator)
 *     security:
 *       - bearerAuth: []
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [NEW, CONTACTED, CLOSED] }
 *     responses:
 *       200: { description: Status yeniləndi }
 *       400: { description: Status yanlışdır }
 *       404: { description: Müraciət tapılmadı }
 */
router.patch("/:id/status", auth, requireAdmin, updateInquiryStatus);

module.exports = router;