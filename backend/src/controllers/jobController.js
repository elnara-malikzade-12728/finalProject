const prisma = require('../lib/prisma');

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

async function listJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      where: buildJobFilters(req.query),
      include: { career: { select: jobCareerSelect } },
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

module.exports = { listJobs, getJobById };
