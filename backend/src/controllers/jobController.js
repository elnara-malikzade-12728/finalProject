const prisma = require('../lib/prisma');

async function listJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({ include: { career: { select: { id: true, title: true } } } });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.' });
  }
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateJob(body, partial = false) {
  const fields = ['title', 'company', 'location', 'description', 'url', 'careerId'];
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Request body must be an object';
  if (Object.keys(body).some(field => !fields.includes(field))) return 'Request contains unsupported fields';
  if (!partial && (typeof body.title !== 'string' || !body.title.trim() || !Number.isInteger(body.careerId))) return 'title and integer careerId are required';
  if (partial && !Object.keys(body).some(field => fields.includes(field))) return 'At least one job field is required';
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) return 'title must be a non-empty string';
  if (body.careerId !== undefined && (!Number.isInteger(body.careerId) || body.careerId < 1)) return 'careerId must be a positive integer';
  for (const field of ['company', 'location', 'description', 'url']) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== 'string') return `${field} must be a string or null`;
  }
  return null;
}

async function getJob(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid job id' });
  const job = await prisma.job.findUnique({ where: { id }, include: { career: { select: { id: true, title: true } } } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
}

async function createJob(req, res) {
  const error = validateJob(req.body);
  if (error) return res.status(400).json({ error });
  const { title, company, location, description, url, careerId } = req.body;
  const career = await prisma.career.findUnique({ where: { id: careerId }, select: { id: true } });
  if (!career) return res.status(400).json({ error: 'careerId does not reference an existing career' });
  const job = await prisma.job.create({ data: { title: title.trim(), company, location, description, url, careerId }, include: { career: { select: { id: true, title: true } } } });
  res.status(201).json(job);
}

async function updateJob(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid job id' });
  const error = validateJob(req.body, true);
  if (error) return res.status(400).json({ error });
  const existing = await prisma.job.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return res.status(404).json({ error: 'Job not found' });
  if (req.body.careerId !== undefined) {
    const career = await prisma.career.findUnique({ where: { id: req.body.careerId }, select: { id: true } });
    if (!career) return res.status(400).json({ error: 'careerId does not reference an existing career' });
  }
  const data = { ...req.body };
  if (data.title) data.title = data.title.trim();
  const job = await prisma.job.update({ where: { id }, data, include: { career: { select: { id: true, title: true } } } });
  res.json(job);
}

async function deleteJob(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid job id' });
  try {
    await prisma.job.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Job not found' });
    throw error;
  }
  res.status(204).send();
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
