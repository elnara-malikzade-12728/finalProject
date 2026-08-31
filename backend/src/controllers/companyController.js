const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

const employmentTypes = new Set(["FULL_TIME", "PART_TIME", "REMOTE", "INTERNSHIP", "FREELANCE"]);
const experienceLevels = new Set(["ENTRY_LEVEL", "JUNIOR", "MID_LEVEL", "SENIOR", "LEAD_MANAGER"]);

async function ownedCompany(userId) {
  return prisma.company.findUnique({ where: { ownerId: userId } });
}

async function saveCompany(req, res) {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const logoUrl = typeof req.body.logoUrl === "string" ? req.body.logoUrl.trim() || null : null;
    if (!name || name.length > 150) return res.status(400).json({ error: "Şirkət adı 1–150 simvol olmalıdır." });
    const company = await prisma.company.upsert({ where: { ownerId: req.user.id }, update: { name, logoUrl }, create: { name, logoUrl, ownerId: req.user.id, members: { create: { userId: req.user.id } } } });
    return res.status(200).json(company);
  } catch (error) {
    logger.error("Şirkət profili saxlanılarkən xəta", error);
    return res.status(500).json({ error: "Şirkət profilini saxlamaq mümkün olmadı." });
  }
}

async function dashboard(req, res) {
  try {
    const company = await prisma.company.findUnique({
      where: { ownerId: req.user.id },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, subscriptions: { where: { status: "ACTIVE" }, take: 1 }, enrollments: { select: { id: true } }, certificates: { select: { id: true } } } } } }, jobs: { orderBy: [{ isPriority: "desc" }, { id: "desc" }] } },
    });
    if (!company) return res.status(200).json(null);
    const members = company.members.map(({ id, joinedAt, user }) => ({ id, joinedAt, userId: user.id, name: user.name, email: user.email, activeSubscription: user.subscriptions.length > 0, enrollments: user.enrollments.length, certificates: user.certificates.length }));
    return res.json({ company: { id: company.id, name: company.name, logoUrl: company.logoUrl, ownerId: company.ownerId }, members, jobs: company.jobs, stats: { employees: members.length, activeSubscriptions: members.filter((m) => m.activeSubscription).length, enrollments: members.reduce((sum, m) => sum + m.enrollments, 0), certificates: members.reduce((sum, m) => sum + m.certificates, 0), priorityJobs: company.jobs.filter((job) => job.isPriority).length } });
  } catch (error) {
    logger.error("Şirkət paneli yüklənərkən xəta", error);
    return res.status(500).json({ error: "Şirkət panelini yükləmək mümkün olmadı." });
  }
}

async function addEmployee(req, res) {
  try {
    const company = await ownedCompany(req.user.id);
    if (!company) return res.status(404).json({ error: "Əvvəlcə şirkət profili yaradın." });
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
    if (!user) return res.status(404).json({ error: "Bu e-poçtla Synex istifadəçisi tapılmadı." });
    const member = await prisma.companyMember.upsert({ where: { companyId_userId: { companyId: company.id, userId: user.id } }, update: {}, create: { companyId: company.id, userId: user.id } });
    return res.status(201).json({ ...member, user });
  } catch (error) {
    logger.error("Əməkdaş əlavə edilərkən xəta", error);
    return res.status(500).json({ error: "Əməkdaşı əlavə etmək mümkün olmadı." });
  }
}

async function removeEmployee(req, res) {
  try {
    const company = await ownedCompany(req.user.id);
    const memberId = Number(req.params.id);
    if (!company || !Number.isInteger(memberId)) return res.status(404).json({ error: "Əməkdaş tapılmadı." });
    const member = await prisma.companyMember.findFirst({ where: { id: memberId, companyId: company.id } });
    if (!member || member.userId === req.user.id) return res.status(400).json({ error: "Şirkət sahibini silmək olmaz." });
    await prisma.companyMember.delete({ where: { id: member.id } });
    return res.status(204).send();
  } catch (error) {
    logger.error("Əməkdaş silinərkən xəta", error);
    return res.status(500).json({ error: "Əməkdaşı silmək mümkün olmadı." });
  }
}

async function createPriorityJob(req, res) {
  try {
    const company = await ownedCompany(req.user.id);
    if (!company) return res.status(404).json({ error: "Əvvəlcə şirkət profili yaradın." });
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    if (!title || !description) return res.status(400).json({ error: "Vakansiya adı və təsviri tələb olunur." });
    const employmentType = employmentTypes.has(req.body.employmentType) ? req.body.employmentType : "FULL_TIME";
    const experienceLevel = experienceLevels.has(req.body.experienceLevel) ? req.body.experienceLevel : null;
    const job = await prisma.job.create({ data: { title, description, company: company.name, companyLogoUrl: company.logoUrl, location: req.body.location?.trim() || null, employmentType, experienceLevel, salaryMin: Number.isInteger(Number(req.body.salaryMin)) ? Number(req.body.salaryMin) : null, salaryMax: Number.isInteger(Number(req.body.salaryMax)) ? Number(req.body.salaryMax) : null, companyAccountId: company.id, isPriority: true } });
    return res.status(201).json(job);
  } catch (error) {
    logger.error("Prioritet vakansiya yaradılarkən xəta", error);
    return res.status(500).json({ error: "Vakansiyanı yaratmaq mümkün olmadı." });
  }
}

module.exports = { saveCompany, dashboard, addEmployee, removeEmployee, createPriorityJob };
