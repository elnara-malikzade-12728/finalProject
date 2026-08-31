const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/**
 * GET /api/subscriptions/me
 * İstifadəçinin ən son (aktiv və ya sonuncu) abunəliyini qaytarır.
 */
async function getMySubscription(req, res) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user.id },
      orderBy: { id: "desc" },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(200).json(null);
    }

    res.json(subscription);
  } catch (err) {
    logger.error("İstifadəçi abunəliyi alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * POST /api/subscriptions/me/cancel
 * Abunəliyi ləğv edir, amma ödənilmiş müddət bitənə qədər aktiv qalır
 * (statusu CANCELLED edirik, expiresAt-i toxunmuruq — access həmin tarixə
 * qədər davam edir, çünki courseAccessService yalnız status=ACTIVE-ə baxır,
 * ona görə cancelledAt-ı saxlayıb, expiresAt bitənə qədər statusu ACTIVE
 * saxlamaq lazımdır. Aşağıda bunu izah edən qeydə bax).
 */
async function cancelMySubscription(req, res) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: "ACTIVE",
      },
      orderBy: { id: "desc" },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Aktiv abunəlik tapılmadı." });
    }

    // Qeyd: statusu CANCELLED etmirik ki, courseAccessService girişi
    // dərhal kəsməsin — "ödənilmiş müddət bitənə qədər aktiv qalır" qaydasına
    // görə status ACTIVE saxlanılır, yalnız cancelledAt yazılır və
    // avtomatik yenilənmə (əgər gələcəkdə recurring olsa) dayandırılır.
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelledAt: new Date() },
      include: { plan: true },
    });

    res.json(updated);
  } catch (err) {
    logger.error("Abunəlik ləğv edilərkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * GET /api/admin/subscriptions
 */
async function listAllSubscriptions(req, res) {
  try {
    const page = parsePositiveInteger(req.query.page) || 1;
    const limit = Math.min(parsePositiveInteger(req.query.limit) || 50, 100);

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(subscriptions);
  } catch (err) {
    logger.error("Bütün abunəliklər alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * GET /api/admin/payments
 */
async function listAllPayments(req, res) {
  try {
    const page = parsePositiveInteger(req.query.page) || 1;
    const limit = Math.min(parsePositiveInteger(req.query.limit) || 50, 100);

    const payments = await prisma.payment.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: true } },
        coursePurchase: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
    });

    res.json(payments);
  } catch (err) {
    logger.error("Bütün ödənişlər alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  getMySubscription,
  cancelMySubscription,
  listAllSubscriptions,
  listAllPayments,
};