const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

const ALLOWED_BILLING_PERIODS = ["MONTHLY", "YEARLY", "ONE_TIME"];

function validatePlanPayload(body = {}, { partial = false } = {}) {
  const hasField = (field) =>
    Object.prototype.hasOwnProperty.call(body, field);
  const data = {};

  if (!partial || hasField("name")) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return { error: "Plan adı daxil edilməlidir." };
    data.name = name;
  }

  if (!partial || hasField("code")) {
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!code) return { error: "Plan kodu daxil edilməlidir." };
    data.code = code;
  }

  if (hasField("description")) {
    data.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }

  if (!partial || hasField("price")) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Qiymət düzgün müsbət ədəd olmalıdır." };
    }
    data.price = price;
  }

  if (hasField("currency")) {
    const currency = String(body.currency || "AZN").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      return { error: "Valyuta 3 hərfli kod olmalıdır." };
    }
    data.currency = currency;
  }

  if (!partial || hasField("billingPeriod")) {
    if (!ALLOWED_BILLING_PERIODS.includes(body.billingPeriod)) {
      return { error: "Ödəniş dövrü yanlışdır." };
    }
    data.billingPeriod = body.billingPeriod;
  }

  if (hasField("active")) {
    data.active = Boolean(body.active);
  }

  return { data };
}

async function listPlans(req, res) {
  try {
    const isAdmin = req.user?.role === "ADMIN";

    const plans = await prisma.plan.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: { id: "asc" },
    });

    res.json(plans);
  } catch (err) {
    logger.error("Plan siyahısı alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function createPlan(req, res) {
  try {
    const validation = validatePlanPayload(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const plan = await prisma.plan.create({ data: validation.data });

    return res.status(201).json(plan);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Bu plan kodu artıq mövcuddur." });
    }

    logger.error("Plan yaradılarkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

async function updatePlan(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan tapılmadı." });

    const validation = validatePlanPayload(req.body, { partial: true });
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Plan tapılmadı." });

    const plan = await prisma.plan.update({
      where: { id },
      data: validation.data,
    });

    return res.status(200).json(plan);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Plan tapılmadı." });
    }
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Bu plan kodu artıq mövcuddur." });
    }

    logger.error("Plan yenilənərkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * Real silmə yerinə: ödənişi olan planı deaktiv edirik (unsafe delete qadağandır).
 */
async function deletePlan(req, res) {
  try {
    const id = parsePositiveInteger(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan tapılmadı." });

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Plan tapılmadı." });

    const paymentCount = await prisma.subscription.count({
      where: { planId: id },
    });

    if (paymentCount > 0) {
      const plan = await prisma.plan.update({
        where: { id },
        data: { active: false },
      });
      return res.status(200).json(plan);
    }

    await prisma.plan.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    logger.error("Plan silinərkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
};