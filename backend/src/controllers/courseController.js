const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

const structureInclude = {
  category: true,
  modules: {
    orderBy: { order: 'asc' },
    include: { lessons: { orderBy: { order: 'asc' } } },
  },
};

function id(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function requiredText(value, max = 150) {
  const result = typeof value === 'string' ? value.trim() : '';
  return result && result.length <= max ? result : null;
}

function optionalText(value) {
  if (value === undefined) return undefined;
  const result = typeof value === 'string' ? value.trim() : '';
  return result || null;
}

function sortOrder(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

async function listCourseStructure(_req, res) {
  try {
    const [categories, courses] = await Promise.all([
      prisma.courseCategory.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
      prisma.course.findMany({ include: structureInclude, orderBy: { createdAt: 'desc' } }),
    ]);
    return res.json({ categories, courses });
  } catch (error) {
    logger.error('Kurs strukturu alınarkən xəta', error);
    return res.status(500).json({ error: 'Kurs strukturunu yükləmək mümkün olmadı.' });
  }
}

async function createCategory(req, res) {
  try {
    const name = requiredText(req.body.name, 100);
    if (!name) return res.status(400).json({ error: 'Kateqoriya adı 1–100 simvol olmalıdır.' });
    const result = await prisma.courseCategory.create({
      data: { name, description: optionalText(req.body.description), order: sortOrder(req.body.order) },
    });
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu kateqoriya artıq mövcuddur.' });
    logger.error('Kurs kateqoriyası yaradılarkən xəta', error);
    return res.status(500).json({ error: 'Kateqoriya yaratmaq mümkün olmadı.' });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = id(req.params.id);
    if (!categoryId) return res.status(400).json({ error: 'Kateqoriya ID-si yanlışdır.' });
    const data = {};
    if ('name' in req.body) {
      data.name = requiredText(req.body.name, 100);
      if (!data.name) return res.status(400).json({ error: 'Kateqoriya adı 1–100 simvol olmalıdır.' });
    }
    if ('description' in req.body) data.description = optionalText(req.body.description);
    if ('order' in req.body) data.order = sortOrder(req.body.order);
    return res.json(await prisma.courseCategory.update({ where: { id: categoryId }, data }));
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Kateqoriya tapılmadı.' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu kateqoriya artıq mövcuddur.' });
    logger.error('Kurs kateqoriyası yenilənərkən xəta', error);
    return res.status(500).json({ error: 'Kateqoriyanı yeniləmək mümkün olmadı.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = id(req.params.id);
    if (!categoryId) return res.status(400).json({ error: 'Kateqoriya ID-si yanlışdır.' });
    await prisma.courseCategory.delete({ where: { id: categoryId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Kateqoriya tapılmadı.' });
    logger.error('Kurs kateqoriyası silinərkən xəta', error);
    return res.status(500).json({ error: 'Kateqoriyanı silmək mümkün olmadı.' });
  }
}

async function createCourse(req, res) {
  try {
    const title = requiredText(req.body.title);
    const categoryId = req.body.categoryId ? id(req.body.categoryId) : null;
    if (!title) return res.status(400).json({ error: 'Kurs adı 1–150 simvol olmalıdır.' });
    if (req.body.categoryId && !categoryId) return res.status(400).json({ error: 'Kateqoriya ID-si yanlışdır.' });
    const result = await prisma.course.create({
      data: { title, description: optionalText(req.body.description), published: req.body.published === true, categoryId },
      include: structureInclude,
    });
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2003') return res.status(404).json({ error: 'Kateqoriya tapılmadı.' });
    logger.error('Kurs yaradılarkən xəta', error);
    return res.status(500).json({ error: 'Kurs yaratmaq mümkün olmadı.' });
  }
}

async function updateCourse(req, res) {
  try {
    const courseId = id(req.params.id);
    if (!courseId) return res.status(400).json({ error: 'Kurs ID-si yanlışdır.' });
    const data = {};
    if ('title' in req.body) {
      data.title = requiredText(req.body.title);
      if (!data.title) return res.status(400).json({ error: 'Kurs adı 1–150 simvol olmalıdır.' });
    }
    if ('description' in req.body) data.description = optionalText(req.body.description);
    if ('published' in req.body) data.published = req.body.published === true;
    if ('categoryId' in req.body) {
      data.categoryId = req.body.categoryId ? id(req.body.categoryId) : null;
      if (req.body.categoryId && !data.categoryId) return res.status(400).json({ error: 'Kateqoriya ID-si yanlışdır.' });
    }
    return res.json(await prisma.course.update({ where: { id: courseId }, data, include: structureInclude }));
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Kurs tapılmadı.' });
    if (error.code === 'P2003') return res.status(404).json({ error: 'Kateqoriya tapılmadı.' });
    logger.error('Kurs yenilənərkən xəta', error);
    return res.status(500).json({ error: 'Kursu yeniləmək mümkün olmadı.' });
  }
}

async function deleteCourse(req, res) {
  try {
    const courseId = id(req.params.id);
    if (!courseId) return res.status(400).json({ error: 'Kurs ID-si yanlışdır.' });
    await prisma.course.delete({ where: { id: courseId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Kurs tapılmadı.' });
    logger.error('Kurs silinərkən xəta', error);
    return res.status(500).json({ error: 'Kursu silmək mümkün olmadı.' });
  }
}

async function createModule(req, res) {
  try {
    const courseId = id(req.params.courseId);
    const title = requiredText(req.body.title);
    if (!courseId || !title) return res.status(400).json({ error: 'Kurs və modul məlumatları yanlışdır.' });
    const result = await prisma.courseModule.create({
      data: { courseId, title, description: optionalText(req.body.description), order: sortOrder(req.body.order) },
      include: { lessons: true },
    });
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu sıra nömrəli modul artıq mövcuddur.' });
    if (error.code === 'P2003') return res.status(404).json({ error: 'Kurs tapılmadı.' });
    logger.error('Kurs modulu yaradılarkən xəta', error);
    return res.status(500).json({ error: 'Modul yaratmaq mümkün olmadı.' });
  }
}

async function updateModule(req, res) {
  try {
    const moduleId = id(req.params.id);
    if (!moduleId) return res.status(400).json({ error: 'Modul ID-si yanlışdır.' });
    const data = {};
    if ('title' in req.body) {
      data.title = requiredText(req.body.title);
      if (!data.title) return res.status(400).json({ error: 'Modul adı daxil edilməlidir.' });
    }
    if ('description' in req.body) data.description = optionalText(req.body.description);
    if ('order' in req.body) data.order = sortOrder(req.body.order);
    return res.json(await prisma.courseModule.update({ where: { id: moduleId }, data }));
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Modul tapılmadı.' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu sıra nömrəli modul artıq mövcuddur.' });
    logger.error('Kurs modulu yenilənərkən xəta', error);
    return res.status(500).json({ error: 'Modulu yeniləmək mümkün olmadı.' });
  }
}

async function deleteModule(req, res) {
  try {
    const moduleId = id(req.params.id);
    if (!moduleId) return res.status(400).json({ error: 'Modul ID-si yanlışdır.' });
    await prisma.courseModule.delete({ where: { id: moduleId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Modul tapılmadı.' });
    logger.error('Kurs modulu silinərkən xəta', error);
    return res.status(500).json({ error: 'Modulu silmək mümkün olmadı.' });
  }
}

async function createLesson(req, res) {
  try {
    const moduleId = id(req.params.moduleId);
    const title = requiredText(req.body.title);
    if (!moduleId || !title) return res.status(400).json({ error: 'Modul və dərs məlumatları yanlışdır.' });
    const result = await prisma.lesson.create({
      data: { moduleId, title, description: optionalText(req.body.description), order: sortOrder(req.body.order), published: req.body.published === true },
    });
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu sıra nömrəli dərs artıq mövcuddur.' });
    if (error.code === 'P2003') return res.status(404).json({ error: 'Modul tapılmadı.' });
    logger.error('Dərs yaradılarkən xəta', error);
    return res.status(500).json({ error: 'Dərs yaratmaq mümkün olmadı.' });
  }
}

async function updateLesson(req, res) {
  try {
    const lessonId = id(req.params.id);
    if (!lessonId) return res.status(400).json({ error: 'Dərs ID-si yanlışdır.' });
    const data = {};
    if ('title' in req.body) {
      data.title = requiredText(req.body.title);
      if (!data.title) return res.status(400).json({ error: 'Dərs adı daxil edilməlidir.' });
    }
    if ('description' in req.body) data.description = optionalText(req.body.description);
    if ('order' in req.body) data.order = sortOrder(req.body.order);
    if ('published' in req.body) data.published = req.body.published === true;
    return res.json(await prisma.lesson.update({ where: { id: lessonId }, data }));
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Dərs tapılmadı.' });
    if (error.code === 'P2002') return res.status(409).json({ error: 'Bu sıra nömrəli dərs artıq mövcuddur.' });
    logger.error('Dərs yenilənərkən xəta', error);
    return res.status(500).json({ error: 'Dərsi yeniləmək mümkün olmadı.' });
  }
}

async function deleteLesson(req, res) {
  try {
    const lessonId = id(req.params.id);
    if (!lessonId) return res.status(400).json({ error: 'Dərs ID-si yanlışdır.' });
    await prisma.lesson.delete({ where: { id: lessonId } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Dərs tapılmadı.' });
    logger.error('Dərs silinərkən xəta', error);
    return res.status(500).json({ error: 'Dərsi silmək mümkün olmadı.' });
  }
}

module.exports = {
  listCourseStructure,
  createCategory,
  updateCategory,
  deleteCategory,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
};
