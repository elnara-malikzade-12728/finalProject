const prisma = require('../lib/prisma');
const logger = require('../utils/logger');

async function upsertProgress(req, res) {
  try {
    const userId = req.user.id;
    const stepId = parseInt(req.params.stepId, 10);
    const { completed } = req.body;

    if (!Number.isInteger(stepId) || stepId < 1) {
      return res.status(400).json({ error: 'Addım ID formatı yanlışdır.' });
    }

    if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed boolean formatında daxil edilməlidir.' });

    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: { id: true },
    });

    if (!step) {
      return res.status(404).json({ error: 'Yol xəritəsi addımı tapılmadı.' });
    }

    const progress = await prisma.progress.upsert({
      where: { userId_stepId: { userId, stepId } },
      update: { completed },
      create: { userId, stepId, completed },
    });

    res.json(progress);
  } catch (err) {
    logger.error('İrəliləyiş yadda saxlanılarkən xəta', err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

module.exports = { upsertProgress };
