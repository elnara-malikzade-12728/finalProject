const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

function getPagination(query) {
  const page = parsePositiveInteger(query.page) || 1;
  const requestedLimit = parsePositiveInteger(query.limit) || 50;
  const limit = Math.min(requestedLimit, 100);

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

async function listCareers(req, res) {
  try {
    const careers = await prisma.career.findMany({
      ...getPagination(req.query),
      select: { id: true, title: true, description: true },
      orderBy: { id: 'asc' },
    });
    res.json(careers);
  } catch (err) {
    logger.error('Kurs siyahısı alınarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function getCareer(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID formatı yanlışdır.' });
    }
    const career = await prisma.career.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } }, jobs: true }
    });
    if (!career) return res.status(404).json({ error: 'Kurs tapılmadı.' });
    res.json(career);
  } catch (err) {
    logger.error('Kurs məlumatı alınarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function getRoadmap(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID formatı yanlışdır.' });
    }

    const career = await prisma.career.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!career) {
      return res.status(404).json({ error: 'Kurs tapılmadı.' });
    }

    const steps = await prisma.step.findMany({ where: { careerId: id }, orderBy: { order: 'asc' } });
    res.json(steps);
  } catch (err) {
    logger.error('Kurs xəritəsi alınarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

module.exports = { listCareers, getCareer, getRoadmap };
