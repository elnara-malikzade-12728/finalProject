const express = require("express");
const router = express.Router();
const {
  listCareers,
  getCareer,
  getRoadmap,
} = require("../controllers/careerController");

/**
 * @openapi
 * /api/careers:
 *   get:
 *     tags:
 *       - Careers
 *     summary: Bütün kursları göstər
 *     description: Mövcud peşə istiqamətlərinin siyahısını qaytarır.
 *     responses:
 *       200:
 *         description: Kursların siyahısı uğurla qaytarıldı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Career'
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", listCareers);

/**
 * @openapi
 * /api/careers/{id}:
 *   get:
 *     tags:
 *       - Careers
 *     summary: Bir peşə haqqında məlumat əldə et
 *     description: Peşəni, onun inkişaf addımlarını və əlaqəli vakansiyaları qaytarır.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Peşənin identifikatoru
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Peşə məlumatları uğurla qaytarıldı
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Career'
 *                 - type: object
 *                   properties:
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           order:
 *                             type: integer
 *                           careerId:
 *                             type: integer
 *                     jobs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Job'
 *       404:
 *         description: Peşə tapılmadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Peşə tapılmadı.
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getCareer);

/**
 * @openapi
 * /api/careers/{id}/roadmap:
 *   get:
 *     tags:
 *       - Careers
 *     summary: Peşənin inkişaf xəritəsini əldə et
 *     description: Seçilmiş peşə üçün sıralanmış inkişaf addımlarını qaytarır.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Peşənin identifikatoru
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: İnkişaf addımları uğurla qaytarıldı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: HTML əsaslarını öyrən
 *                   description:
 *                     type: string
 *                     nullable: true
 *                   order:
 *                     type: integer
 *                     example: 1
 *                   careerId:
 *                     type: integer
 *                     example: 1
 *       500:
 *         description: Server və ya verilənlər bazası xətası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/roadmap", getRoadmap);

module.exports = router;
