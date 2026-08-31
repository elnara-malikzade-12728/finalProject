const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ["NEW", "CONTACTED", "APPROVED", "CLOSED"];

function validateInquiryPayload(body = {}) {
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!companyName) return { error: "Şirkət adı daxil edilməlidir." };
  if (!contactName) return { error: "Əlaqədar şəxsin adı daxil edilməlidir." };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { error: "Düzgün email ünvanı daxil edilməlidir." };
  }
  if (!message) return { error: "Mesaj/təlim ehtiyacı daxil edilməlidir." };

  const data = { companyName, contactName, email, message };

  if (body.phone !== undefined) {
    data.phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
  }

  if (body.employeeCount !== undefined && body.employeeCount !== null && body.employeeCount !== "") {
    const employeeCount = Number(body.employeeCount);
    if (!Number.isInteger(employeeCount) || employeeCount < 1) {
      return { error: "İşçi sayı müsbət tam ədəd olmalıdır." };
    }
    data.employeeCount = employeeCount;
  }

  return { data };
}

/**
 * POST /api/corporate-inquiries (ictimai)
 */
async function createInquiry(req, res) {
  try {
    const validation = validateInquiryPayload(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const inquiry = await prisma.corporateInquiry.create({
      data: validation.data,
    });

    return res.status(201).json(inquiry);
  } catch (err) {
    logger.error("Korporativ müraciət yaradılarkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * GET /api/corporate-inquiries (admin) — status ilə filtr dəstəklənir
 */
async function listInquiries(req, res) {
  try {
    const status = ALLOWED_STATUSES.includes(req.query.status)
      ? req.query.status
      : undefined;

    const inquiries = await prisma.corporateInquiry.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
    });

    res.json(inquiries);
  } catch (err) {
    logger.error("Korporativ müraciətlər alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * PATCH /api/corporate-inquiries/:id/status (admin)
 */
async function updateInquiryStatus(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);
    if (!id) return res.status(404).json({ error: "Müraciət tapılmadı." });

    const { status } = req.body || {};

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status yanlışdır." });
    }

    const existing = await prisma.corporateInquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Müraciət tapılmadı." });
    }

    let inquiry;
    if (status === "APPROVED") {
      const user = await prisma.user.findUnique({ where: { email: existing.email.toLowerCase() }, select: { id: true } });
      if (!user) return res.status(409).json({ error: "Təsdiq üçün müraciətdəki e-poçtla qeydiyyatdan keçmiş Synex istifadəçisi olmalıdır." });
      inquiry = await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: user.id }, data: { isCorporate: true, tokenVersion: { increment: 1 } } });
        return tx.corporateInquiry.update({ where: { id }, data: { status } });
      });
    } else {
      inquiry = await prisma.corporateInquiry.update({ where: { id }, data: { status } });
    }

    res.json(inquiry);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Müraciət tapılmadı." });
    }

    logger.error("Müraciət statusu yenilənərkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
  validateInquiryPayload,
};
