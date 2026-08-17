const prisma = require('../lib/prisma');

async function listCareers(req, res) {
  try {
    const careers = await prisma.career.findMany({ select: { id: true, title: true, description: true } });
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function getCareer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const career = await prisma.career.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } }, jobs: true }
    });
    if (!career) return res.status(404).json({ error: 'Peşə tapılmadı' });
    res.json(career);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

async function getRoadmap(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const steps = await prisma.step.findMany({ where: { careerId: id }, orderBy: { order: 'asc' } });
    res.json(steps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

module.exports = { listCareers, getCareer, getRoadmap };
