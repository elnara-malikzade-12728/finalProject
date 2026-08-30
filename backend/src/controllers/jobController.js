const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

const jobCareerSelect = {
  id: true,
  title: true,
};

const jobDetailsCareerSelect = {
  id: true,
  title: true,
  description: true,
};

const jobInclude = {
  career: { select: jobCareerSelect },
  course: { select: jobCareerSelect },
};

const jobDetailsInclude = {
  career: { select: jobDetailsCareerSelect },
  course: { select: jobDetailsCareerSelect },
};

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function normalizeFilter(value) {
  if (value === undefined || value === null) {
    return '';
  }

  const trimmed = String(value).trim();

  if (
    !trimmed ||
    trimmed === 'Hamısı' ||
    trimmed === 'ALL'
  ) {
    return '';
  }

  return trimmed;
}

function buildJobFilters(query = {}) {
  const search = normalizeFilter(query.search);
  const location = normalizeFilter(query.location);
  const category = normalizeFilter(query.category);
  const careerId = parsePositiveInteger(query.careerId);
  const courseId = parsePositiveInteger(query.courseId);
  const employmentType = normalizeFilter(query.employmentType);
  const experienceLevel = normalizeFilter(query.experienceLevel);
  const activeValue = query.active;
  const salaryMin = parsePositiveInteger(query.salaryMin);
  const salaryMax = parsePositiveInteger(query.salaryMax);
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  if (careerId) {
    where.careerId = careerId;
  }
  if (courseId) where.courseId = courseId;

  if (['FULL_TIME', 'PART_TIME', 'REMOTE', 'INTERNSHIP', 'FREELANCE'].includes(employmentType)) {
    where.employmentType = employmentType;
  }

  if (['JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD_MANAGER'].includes(experienceLevel)) {
    where.experienceLevel = experienceLevel;
  }

  if (activeValue !== undefined) {
    if (activeValue === 'true' || activeValue === true) {
      where.active = true;
    } else if (activeValue === 'false' || activeValue === false) {
      where.active = false;
    }
  }

  if (salaryMin || salaryMax) {
    where.salaryMin = {
      ...(salaryMin ? { gte: salaryMin } : {}),
      ...(salaryMax ? { lte: salaryMax } : {}),
    };
  }

  if (category) {
    const categoryCareerId = parsePositiveInteger(category);

    if (categoryCareerId) {
      if (where.careerId && where.careerId !== categoryCareerId) {
        where.id = { in: [] };
      } else {
        where.careerId = categoryCareerId;
      }
    } else {
      where.OR = [
        ...(where.OR || []),
        { career: { title: { contains: category, mode: 'insensitive' } } },
        { course: { title: { contains: category, mode: 'insensitive' } } },
      ];
    }
  }

  return where;
}

function normalizeOptionalString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function isValidHttpUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateJobPayload(body = {}, { partial = false } = {}) {
  const allowedFields = [
    'title',
    'company',
    'location',
    'description',
    'url',
    'careerId',
    'courseId',
    'employmentType',
    'experienceLevel',
    'salaryMin',
    'salaryMax',
    'salaryCurrency',
    'companyLogoUrl',
  ];
  const hasField = (field) =>
    Object.prototype.hasOwnProperty.call(body, field);
  const data = {};

  if (!partial || hasField('title')) {
    const title =
      typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return { error: 'Vakansiya adı daxil edilməlidir.' };
    }

    data.title = title;
  }

  if (hasField('careerId')) data.careerId = body.careerId ? parsePositiveInteger(body.careerId) : null;
  if (hasField('courseId')) data.courseId = body.courseId ? parsePositiveInteger(body.courseId) : null;
  if (!partial && !data.careerId && !data.courseId) return { error: 'Düzgün kurs seçilməlidir.' };
  if ((body.careerId && !data.careerId) || (body.courseId && !data.courseId)) return { error: 'Kurs ID-si yanlışdır.' };

  for (const field of [
    'company',
    'location',
    'description',
    'url',
    'companyLogoUrl',
  ]) {
    if (!partial || hasField(field)) {
      data[field] = normalizeOptionalString(body[field]);
    }
  }

  if (!isValidHttpUrl(data.url)) {
    return {
      error: 'Müraciət keçidi http:// və ya https:// ilə başlamalıdır.',
    };
  }

  if (!isValidHttpUrl(data.companyLogoUrl)) {
    return { error: 'Şirkət loqosu keçidi http:// və ya https:// ilə başlamalıdır.' };
  }

  if (!partial || hasField('employmentType')) {
    const value = body.employmentType || 'FULL_TIME';
    if (!['FULL_TIME', 'PART_TIME', 'INTERNSHIP'].includes(value)) {
      return { error: 'İş növü yanlışdır.' };
    }
    data.employmentType = value;
  }

  if (!partial || hasField('experienceLevel')) {
    const value = body.experienceLevel || null;
    if (value && !['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR'].includes(value)) {
      return { error: 'Təcrübə səviyyəsi yanlışdır.' };
    }
    data.experienceLevel = value;
  }

  for (const field of ['salaryMin', 'salaryMax']) {
    if (!partial || hasField(field)) {
      if (body[field] === null || body[field] === '' || body[field] === undefined) {
        data[field] = null;
      } else {
        const value = Number(body[field]);
        if (!Number.isInteger(value) || value < 0) return { error: 'Maaş müsbət tam ədəd olmalıdır.' };
        data[field] = value;
      }
    }
  }

  if (data.salaryMin !== undefined && data.salaryMax !== undefined && data.salaryMin !== null && data.salaryMax !== null && data.salaryMin > data.salaryMax) {
    return { error: 'Minimum maaş maksimum maaşdan böyük ola bilməz.' };
  }

  if (!partial || hasField('salaryCurrency')) {
    const currency = String(body.salaryCurrency || 'AZN').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) return { error: 'Valyuta 3 hərfli kod olmalıdır.' };
    data.salaryCurrency = currency;
  }

  if (partial && !allowedFields.some(hasField)) {
    return { error: 'Yenilənəcək məlumat daxil edilməlidir.' };
  }

  return { data };
}

async function careerExists(careerId) {
  if (careerId === undefined || careerId === null) {
    return true;
  }

  const career = await prisma.career.findUnique({
    where: { id: careerId },
    select: { id: true },
  });

  return Boolean(career);
}

async function courseExists(courseId) {
  if (courseId === undefined || courseId === null) return true;
  return Boolean(await prisma.course.findFirst({ where: { id: courseId, published: true }, select: { id: true } }));
}

async function listJobs(req, res) {
  try {
    const page = parsePositiveInteger(req.query.page) || 1;
    const limit = Math.min(
      parsePositiveInteger(req.query.limit) || 50,
      100,
    );
    const jobs = await prisma.job.findMany({
      where: buildJobFilters(req.query),
      include: jobInclude,
      orderBy: { id: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    res.json(jobs);
  } catch (err) {
    logger.error('Vakansiya siyahısı alınarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function getJobById(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: jobDetailsInclude,
    });

    if (!job) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    res.json(job);
  } catch (err) {
    logger.error('Vakansiya məlumatı alınarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function createJob(req, res) {
  try {
    const validation = validateJobPayload(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    if (!(await careerExists(validation.data.careerId))) {
      return res.status(404).json({ error: 'Peşə tapılmadı.' });
    }
    if (!(await courseExists(validation.data.courseId))) {
      return res.status(404).json({ error: 'Kurs tapılmadı.' });
    }

    const job = await prisma.job.create({
      data: validation.data,
      include: jobInclude,
    });

    return res.status(201).json(job);
  } catch (err) {
    logger.error('Vakansiya yaradılarkən xəta', err);
    return res.status(500).json({
      error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
    });
  }
}

async function updateJob(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    const validation = validateJobPayload(req.body, { partial: true });

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    if (!(await careerExists(validation.data.careerId))) {
      return res.status(404).json({ error: 'Peşə tapılmadı.' });
    }
    if (!(await courseExists(validation.data.courseId))) {
      return res.status(404).json({ error: 'Kurs tapılmadı.' });
    }

    const job = await prisma.job.update({
      where: { id },
      data: validation.data,
      include: jobInclude,
    });

    return res.status(200).json(job);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    logger.error('Vakansiya yenilənərkən xəta', err);
    return res.status(500).json({
      error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
    });
  }
}

async function deleteJob(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.application.deleteMany({
        where: { jobId: id },
      });
      await transaction.job.delete({ where: { id } });
    });

    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vakansiya tapılmadı.' });
    }

    logger.error('Vakansiya silinərkən xəta', err);
    return res.status(500).json({
      error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
    });
  }
}

module.exports = {
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
