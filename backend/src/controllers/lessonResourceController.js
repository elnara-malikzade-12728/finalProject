const prisma = require('../lib/prisma');
const logger = require('../utils/logger');
const { canAccessCourse, getFreePreviewLessonIds } = require('../services/courseAccessService');
const { isLessonUnlockedForUser } = require('../services/lessonUnlockService');

const ALLOWED_TYPES = new Set(['PDF', 'DOC', 'DOCX', 'ZIP', 'LINK']);
const parseId = (value) => { const result = Number(value); return Number.isInteger(result) && result > 0 ? result : null; };
const cleanText = (value, max) => typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : null;
const secureUrl = (value) => {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : null; } catch { return null; }
};

async function getLessonContext(lessonId) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, published: true, module: { select: { courseId: true, course: { select: { modules: { orderBy: { order: 'asc' }, select: { lessons: { where: { published: true }, orderBy: { order: 'asc' }, select: { id: true } } } } } } } } },
  });
}

async function listResources(req, res) {
  try {
    const lessonId = parseId(req.params.lessonId);
    if (!lessonId) return res.status(400).json({ error: 'Dərs ID-si yanlışdır.' });
    const lesson = await getLessonContext(lessonId);
    if (!lesson || (!lesson.published && req.user?.role !== 'ADMIN')) return res.status(404).json({ error: 'Dərs tapılmadı.' });
    if (req.user?.role !== 'ADMIN') {
      const courseId = lesson.module.courseId;
      const freeIds = getFreePreviewLessonIds(lesson.module.course.modules);
      const isFree = freeIds.includes(lessonId);
      if (!isFree && !req.user) return res.status(401).json({ error: 'Autentifikasiya tələb olunur.' });
      if (!isFree && !(await canAccessCourse(req.user.id, courseId))) return res.status(403).json({ error: 'Bu materiallar üçün kursa giriş tələb olunur.' });
      if (!isFree && !(await isLessonUnlockedForUser(req.user.id, courseId, lessonId))) return res.status(403).json({ error: 'Bu dərs hələ kilidlidir.' });
    }
    const resources = await prisma.lessonResource.findMany({ where: { lessonId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] });
    return res.json(resources);
  } catch (error) {
    logger.error('Dərs materialları alınarkən xəta', error);
    return res.status(500).json({ error: 'Dərs materiallarını yükləmək mümkün olmadı.' });
  }
}

function resourceData(body, partial = false) {
  const data = {};
  if (!partial || body.title !== undefined) { data.title = cleanText(body.title, 150); if (!data.title) return null; }
  if (!partial || body.url !== undefined) { data.url = secureUrl(body.url); if (!data.url) return null; }
  if (body.description !== undefined) data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 1000) || null : null;
  if (body.fileType !== undefined) { const type = String(body.fileType || 'LINK').toUpperCase(); if (!ALLOWED_TYPES.has(type)) return null; data.fileType = type; }
  if (body.order !== undefined) { const order = Number(body.order); if (!Number.isInteger(order) || order < 0) return null; data.order = order; }
  return data;
}

async function createResource(req, res) {
  try {
    const lessonId = parseId(req.params.lessonId); const data = resourceData(req.body || {});
    if (!lessonId || !data) return res.status(400).json({ error: 'Başlıq, HTTPS keçidi və material növünü düzgün daxil edin.' });
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
    if (!lesson) return res.status(404).json({ error: 'Dərs tapılmadı.' });
    return res.status(201).json(await prisma.lessonResource.create({ data: { ...data, lessonId } }));
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu material artıq dərsə əlavə edilib.' });
    logger.error('Dərs materialı yaradılarkən xəta', error); return res.status(500).json({ error: 'Materialı əlavə etmək mümkün olmadı.' });
  }
}

async function updateResource(req, res) {
  try {
    const resourceId = parseId(req.params.id); const data = resourceData(req.body || {}, true);
    if (!resourceId || !data || !Object.keys(data).length) return res.status(400).json({ error: 'Yenilənəcək məlumat yanlışdır.' });
    return res.json(await prisma.lessonResource.update({ where: { id: resourceId }, data }));
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Material tapılmadı.' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu material artıq dərsə əlavə edilib.' });
    logger.error('Dərs materialı yenilənərkən xəta', error); return res.status(500).json({ error: 'Materialı yeniləmək mümkün olmadı.' });
  }
}

async function deleteResource(req, res) {
  try { const resourceId = parseId(req.params.id); if (!resourceId) return res.status(400).json({ error: 'Material ID-si yanlışdır.' }); await prisma.lessonResource.delete({ where: { id: resourceId } }); return res.status(204).end(); }
  catch (error) { if (error.code === 'P2025') return res.status(404).json({ error: 'Material tapılmadı.' }); logger.error('Dərs materialı silinərkən xəta', error); return res.status(500).json({ error: 'Materialı silmək mümkün olmadı.' }); }
}

module.exports = { listResources, createResource, updateResource, deleteResource, secureUrl };
