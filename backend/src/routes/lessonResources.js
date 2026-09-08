const express = require('express');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const requireAdmin = require('../middleware/requireAdmin');
const controller = require('../controllers/lessonResourceController');
const router = express.Router();

/**
 * @openapi
 * /api/lessons/{lessonId}/resources:
 *   get:
 *     tags: [Learning]
 *     summary: Dərsin əlavə materiallarını əldə et
 *     description: İlk iki pulsuz dərs üçün açıqdır; digər dərslərdə autentifikasiya, kurs girişi və ardıcıllıq yoxlanılır.
 *     parameters:
 *       - { in: path, name: lessonId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Dərs materialları }
 *       403: { description: Kurs girişi yoxdur və ya dərs kilidlidir }
 *   post:
 *     tags: [Course Management]
 *     summary: Dərsə HTTPS materialı əlavə et
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: lessonId, required: true, schema: { type: integer } }
 *     responses:
 *       201: { description: Material əlavə edildi }
 * /api/lesson-resources/{id}:
 *   patch:
 *     tags: [Course Management]
 *     summary: Dərs materialını yenilə
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Material yeniləndi }
 *   delete:
 *     tags: [Course Management]
 *     summary: Dərs materialını sil
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Material silindi }
 */

router.get('/lessons/:lessonId/resources', optionalAuth, controller.listResources);
router.post('/lessons/:lessonId/resources', auth, requireAdmin, controller.createResource);
router.patch('/lesson-resources/:id', auth, requireAdmin, controller.updateResource);
router.delete('/lesson-resources/:id', auth, requireAdmin, controller.deleteResource);

module.exports = router;
