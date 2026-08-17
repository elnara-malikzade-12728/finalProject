const prisma = require('../lib/prisma');

async function listCareers(req, res) {
  try {
    const careers = await prisma.career.findMany({ select: { id: true, title: true, description: true } });
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getCareer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const career = await prisma.career.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } }, jobs: true }
    });
    if (!career) return res.status(404).json({ error: 'Career not found' });
    res.json(career);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getRoadmap(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const steps = await prisma.step.findMany({ where: { careerId: id }, orderBy: { order: 'asc' } });
    res.json(steps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listCareers, getCareer, getRoadmap };
