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

  if (category) {
    const categoryCareerId = parsePositiveInteger(category);

    if (categoryCareerId) {
      if (where.careerId && where.careerId !== categoryCareerId) {
        where.id = { in: [] };
      } else {
        where.careerId = categoryCareerId;
      }
    } else {
      where.career = {
        title: {
          contains: category,
          mode: 'insensitive',
        },
      };
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

  if (!partial || hasField('careerId')) {
    const careerId = parsePositiveInteger(body.careerId);

    if (!careerId) {
      return { error: 'Düzgün peşə seçilməlidir.' };
    }

    data.careerId = careerId;
  }

  for (const field of [
    'company',
    'location',
    'description',
    'url',
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

  if (partial && !allowedFields.some(hasField)) {
    return { error: 'Yenilənəcək məlumat daxil edilməlidir.' };
  }

  return { data };
}

async function careerExists(careerId) {
  if (careerId === undefined) {
    return true;
  }

  const career = await prisma.career.findUnique({
    where: { id: careerId },
    select: { id: true },
  });

  return Boolean(career);
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
      include: { career: { select: jobCareerSelect } },
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
      include: { career: { select: jobDetailsCareerSelect } },
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

    const job = await prisma.job.create({
      data: validation.data,
      include: { career: { select: jobCareerSelect } },
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

    const job = await prisma.job.update({
      where: { id },
      data: validation.data,
      include: { career: { select: jobCareerSelect } },
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
