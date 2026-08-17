const prisma = require('../lib/prisma');

async function upsertProgress(req, res) {
  try {
    const userId = req.user.id;
    const stepId = parseInt(req.params.stepId, 10);
    const { completed } = req.body;

    if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed (boolean) is required' });

    // Upsert: find existing entry
    const existing = await prisma.progress.findFirst({ where: { userId, stepId } });
    let progress;
    if (existing) {
      progress = await prisma.progress.update({ where: { id: existing.id }, data: { completed } });
    } else {
      progress = await prisma.progress.create({ data: { user: { connect: { id: userId } }, step: { connect: { id: stepId } }, completed } });
    }

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { upsertProgress };
