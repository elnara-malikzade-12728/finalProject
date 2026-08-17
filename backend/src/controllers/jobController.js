const prisma = require('../lib/prisma');

async function listJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({ include: { career: { select: { id: true, title: true } } } });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listJobs };
