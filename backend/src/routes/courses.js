const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const controller = require('../controllers/courseController');

const router = express.Router();

router.get('/', controller.listPublishedCourses);
router.get('/admin', auth, requireAdmin, controller.listCourseStructure);
router.get('/:id', controller.getPublishedCourse);

/**
 * @openapi
 * /api/courses/{id}/enroll:
 *   post:
 *     tags: [Learning]
 *     summary: Yayımlanmış kursa qeydiyyatdan keç
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       201: { description: Kurs qeydiyyatı yaradıldı }
 *       200: { description: İstifadəçi artıq kursa qeydiyyatdan keçib }
 *       403: { description: Administrator qeydiyyatı qadağandır və ya aktiv abunəlik/kurs alışı yoxdur }
 *       404: { description: Kurs tapılmadı }
 * /api/courses/{id}/me:
 *   get:
 *     tags: [Learning]
 *     summary: Kurs qeydiyyatını və dərs irəliləyişini əldə et
 *     description: Tamamlanmış dərslərlə yanaşı, əvvəlki dərs və test nəticəsinə əsasən kilidli dərslərin ID-lərini qaytarır.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Qeydiyyat, irəliləyiş və kilidli dərslər }
 *       404: { description: Kurs tapılmadı }
 * /api/courses/lessons/{id}/progress:
 *   put:
 *     tags: [Learning]
 *     summary: Dərsin izləmə irəliləyişini yadda saxla
 *     description: İzləmə faizi 90 və ya daha çox olduqda dərs avtomatik tamamlanmış hesab edilir.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [watchedPercentage, lastPositionSeconds]
 *             properties:
 *               watchedPercentage: { type: integer, minimum: 0, maximum: 100, example: 45 }
 *               lastPositionSeconds: { type: integer, minimum: 0, example: 135 }
 *     responses:
 *       200: { description: Dərs irəliləyişi saxlanıldı }
 *       403: { description: Kurs qeydiyyatı, aktiv abunəlik/kurs alışı tələb olunur və ya dərs hələ kilidlidir }
 *       404: { description: Dərs tapılmadı }
 */
router.post('/:id/enroll', auth, controller.enrollInCourse);
router.get('/:id/me', auth, controller.getMyCourseState);
router.put('/lessons/:id/progress', auth, controller.updateLessonProgress);

router.use(auth, requireAdmin);

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags: [Course Management]
 *     summary: Yayımlanmış kursları əldə et
 *     description: İctimai kataloq üçün yalnız yayımlanmış kursları qaytarır.
 *     responses:
 *       200:
 *         description: Yayımlanmış kurslar
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ManagedCourse' }
 *   post:
 *     tags: [Course Management]
 *     summary: Yeni kurs yarat
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Introduction to Ethical Hacking }
 *               description: { type: string, nullable: true }
 *               categoryId: { type: integer, nullable: true }
 *               published: { type: boolean, default: false }
 *     responses:
 *       201: { description: Kurs yaradıldı }
 *       400: { description: Məlumatlar yanlışdır }
 *       403: { description: Administrator icazəsi tələb olunur }
 * /api/courses/{id}:
 *   get:
 *     tags: [Course Management]
 *     summary: Yayımlanmış kursun proqramını əldə et
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Kursun modulları və yayımlanmış dərsləri }
 *       404: { description: Kurs tapılmadı və ya yayımlanmayıb }
 *   patch:
 *     tags: [Course Management]
 *     summary: Kursu yenilə və ya yayım vəziyyətini dəyiş
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { title: { type: string }, description: { type: string, nullable: true }, categoryId: { type: integer, nullable: true }, published: { type: boolean } } }
 *     responses:
 *       200: { description: Kurs yeniləndi }
 *       404: { description: Kurs tapılmadı }
 *   delete:
 *     tags: [Course Management]
 *     summary: Kursu modulları və dərsləri ilə birlikdə sil
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Kurs silindi }
 *       404: { description: Kurs tapılmadı }
 * /api/courses/admin:
 *   get:
 *     tags: [Course Management]
 *     summary: Tam kurs strukturunu idarəetmə üçün əldə et
 *     description: Qaralamalar daxil olmaqla kateqoriya, kurs, modul və dərsləri qaytarır.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Tam kurs strukturu }
 *       401: { description: Autentifikasiya tələb olunur }
 *       403: { description: Administrator icazəsi tələb olunur }
 */
router.post('/', controller.createCourse);

/**
 * @openapi
 * /api/courses/categories:
 *   post:
 *     tags: [Course Management]
 *     summary: Kurs kateqoriyası yarat
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [name], properties: { name: { type: string, example: Cybersecurity }, description: { type: string }, order: { type: integer, minimum: 0 } } }
 *     responses:
 *       201: { description: Kateqoriya yaradıldı }
 *       409: { description: Kateqoriya artıq mövcuddur }
 * /api/courses/categories/{id}:
 *   patch:
 *     tags: [Course Management]
 *     summary: Kurs kateqoriyasını yenilə
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { name: { type: string }, description: { type: string, nullable: true }, order: { type: integer } } }
 *     responses:
 *       200: { description: Kateqoriya yeniləndi }
 *       404: { description: Kateqoriya tapılmadı }
 *   delete:
 *     tags: [Course Management]
 *     summary: Kurs kateqoriyasını sil
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Kateqoriya silindi }
 */
router.post('/categories', controller.createCategory);
router.patch('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

/**
 * @openapi
 * /api/courses/{courseId}/modules:
 *   post:
 *     tags: [Course Management]
 *     summary: Kursa modul əlavə et
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: courseId, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [title, order], properties: { title: { type: string }, description: { type: string }, order: { type: integer, minimum: 0 } } }
 *     responses:
 *       201: { description: Modul yaradıldı }
 *       409: { description: Sıra nömrəsi artıq istifadə olunur }
 * /api/courses/modules/{id}:
 *   patch:
 *     tags: [Course Management]
 *     summary: Modulu yenilə
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { title: { type: string }, description: { type: string }, order: { type: integer } } }
 *     responses:
 *       200: { description: Modul yeniləndi }
 *   delete:
 *     tags: [Course Management]
 *     summary: Modulu dərsləri ilə birlikdə sil
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Modul silindi }
 */
router.post('/:courseId/modules', controller.createModule);
router.patch('/modules/:id', controller.updateModule);
router.delete('/modules/:id', controller.deleteModule);

/**
 * @openapi
 * /api/courses/modules/{moduleId}/lessons:
 *   post:
 *     tags: [Course Management]
 *     summary: Modula dərs əlavə et
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: moduleId, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [title, order], properties: { title: { type: string }, description: { type: string }, order: { type: integer }, published: { type: boolean } } }
 *     responses:
 *       201: { description: Dərs yaradıldı }
 *       409: { description: Sıra nömrəsi artıq istifadə olunur }
 * /api/courses/lessons/{id}:
 *   patch:
 *     tags: [Course Management]
 *     summary: Dərsi yenilə
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { title: { type: string }, description: { type: string }, order: { type: integer }, published: { type: boolean } } }
 *     responses:
 *       200: { description: Dərs yeniləndi }
 *   delete:
 *     tags: [Course Management]
 *     summary: Dərsi sil
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       204: { description: Dərs silindi }
 */
router.post('/modules/:moduleId/lessons', controller.createLesson);
router.patch('/lessons/:id', controller.updateLesson);
router.delete('/lessons/:id', controller.deleteLesson);
router.patch('/:id', controller.updateCourse);
router.delete('/:id', controller.deleteCourse);

module.exports = router;
