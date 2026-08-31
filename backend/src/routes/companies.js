const express = require("express");
const auth = require("../middleware/auth");
const { saveCompany, dashboard, addEmployee, removeEmployee, createPriorityJob } = require("../controllers/companyController");
const router = express.Router();

/**
 * @openapi
 * /api/companies/me:
 *   get:
 *     tags: [Corporate]
 *     summary: Şirkət paneli və əməkdaş statistikasını göstər
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Şirkət paneli və ya null } }
 *   put:
 *     tags: [Corporate]
 *     summary: Şirkət profilini yarat və ya yenilə
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties: { name: { type: string }, logoUrl: { type: string, nullable: true } }
 *     responses: { 200: { description: Şirkət profili saxlanıldı } }
 * /api/companies/me/employees:
 *   post:
 *     tags: [Corporate]
 *     summary: Synex istifadəçisini şirkətə əməkdaş kimi əlavə et
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Əməkdaş əlavə edildi } }
 * /api/companies/me/jobs:
 *   post:
 *     tags: [Corporate]
 *     summary: Prioritet korporativ vakansiya yarat
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Prioritet vakansiya yaradıldı } }
 */

router.use(auth);
router.get("/me", dashboard);
router.put("/me", saveCompany);
router.post("/me/employees", addEmployee);
router.delete("/me/employees/:id", removeEmployee);
router.post("/me/jobs", createPriorityJob);

module.exports = router;
