const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const paymentService = require("../services/paymentService");

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * POST /api/payments/checkout
 * Frontend yalnız planId VƏ YA courseId göndərir.
 * Qiyməti heç vaxt frontend-dən qəbul etmirik — DB-dən oxuyuruq.
 */
async function createCheckout(req, res) {
  try {
    const { planId, courseId } = req.body || {};

    if (!planId && !courseId) {
      return res.status(400).json({
        error: "planId və ya courseId göndərilməlidir.",
      });
    }

    if (planId && courseId) {
      return res.status(400).json({
        error: "Yalnız planId və ya yalnız courseId göndərilə bilər.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true },
    });

    let amount;
    let currency;
    let productName;
    let metadata;

    if (planId) {
      const id = parsePositiveInteger(planId);
      if (!id) return res.status(400).json({ error: "planId yanlışdır." });

      const plan = await prisma.plan.findUnique({ where: { id } });

      if (!plan || !plan.active) {
        return res.status(404).json({ error: "Plan tapılmadı." });
      }

      if (plan.billingPeriod === "ONE_TIME") {
        return res.status(400).json({
          error: "Bu plan tək kurs alışı üçündür, courseId göndərin.",
        });
      }

      amount = plan.price;
      currency = plan.currency;
      productName = plan.name;
      metadata = {
        userId: String(user.id),
        type: "subscription",
        planId: String(plan.id),
      };
    } else {
      const cId = parsePositiveInteger(courseId);
      if (!cId) return res.status(400).json({ error: "courseId yanlışdır." });

      const alreadyOwned = await prisma.coursePurchase.findFirst({
        where: {
          userId: user.id,
          courseId: cId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (alreadyOwned) {
        return res.status(400).json({ error: "Bu kursu artıq almısınız." });
      }

      const singleCoursePlan = await prisma.plan.findFirst({
        where: { billingPeriod: "ONE_TIME", active: true },
      });

      if (!singleCoursePlan) {
        return res.status(500).json({
          error: "Tək kurs alışı üçün qiymət planı tapılmadı.",
        });
      }

      amount = singleCoursePlan.price;
      currency = singleCoursePlan.currency;
      productName = `${singleCoursePlan.name} — Kurs #${cId}`;
      metadata = {
        userId: String(user.id),
        type: "course",
        courseId: String(cId),
      };
    }

    const session = await paymentService.createCheckoutSession({
      user,
      amount,
      currency,
      productName,
      metadata,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    logger.error("Checkout sessiyası yaradılarkən xəta", err);
    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

/**
 * POST /api/payments/webhook
 * DİQQƏT: bu route-a server.js-də express.raw() tətbiq olunmalıdır.
 */
async function handleWebhook(req, res) {
  let event;

  try {
    event = paymentService.verifyWebhookSignature(
      req.body,
      req.headers["stripe-signature"],
    );
  } catch (err) {
    logger.error("Webhook imzası doğrulanmadı", err);
    return res.status(400).json({ error: "Webhook imzası yanlışdır." });
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return res.status(200).json({ received: true });
    }

    const session = event.data.object;
    const providerReference = session.id;

    // İdempotentlik: bu event artıq emal olunubsa, təkrar giriş vermə.
    const existingPayment = await prisma.payment.findUnique({
      where: { providerReference },
    });

    if (existingPayment) {
      return res.status(200).json({ received: true });
    }

    const metadata = session.metadata || {};
    const userId = parsePositiveInteger(metadata.userId);
    const amount = (session.amount_total || 0) / 100;
    const currency = (session.currency || "azn").toUpperCase();
    const paymentStatus =
      session.payment_status === "paid" ? "SUCCEEDED" : "FAILED";

    if (!userId) {
      logger.error("Webhook metadata-da userId yoxdur", { providerReference });
      return res.status(200).json({ received: true });
    }

    if (metadata.type === "subscription") {
      const planId = parsePositiveInteger(metadata.planId);
      const plan = planId
        ? await prisma.plan.findUnique({ where: { id: planId } })
        : null;

      await prisma.$transaction(async (tx) => {
        let subscriptionId = null;

        if (paymentStatus === "SUCCEEDED" && plan) {
          const now = new Date();
          const expiresAt =
            plan.billingPeriod === "YEARLY"
              ? addYears(now, 1)
              : addMonths(now, 1);

          const subscription = await tx.subscription.create({
            data: {
              userId,
              planId: plan.id,
              status: "ACTIVE",
              startedAt: now,
              expiresAt,
            },
          });

          subscriptionId = subscription.id;
        } else if (plan) {
          const subscription = await tx.subscription.create({
            data: {
              userId,
              planId: plan.id,
              status: "PAYMENT_FAILED",
            },
          });

          subscriptionId = subscription.id;
        }

        await tx.payment.create({
          data: {
            userId,
            subscriptionId,
            providerReference,
            amount,
            currency,
            status: paymentStatus,
          },
        });
      });
    } else if (metadata.type === "course") {
      const courseId = parsePositiveInteger(metadata.courseId);

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId,
            providerReference,
            amount,
            currency,
            status: paymentStatus,
          },
        });

        if (paymentStatus === "SUCCEEDED" && courseId) {
          const expiresAt = addYears(new Date(), 1);

          await tx.coursePurchase.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: { paymentId: payment.id, expiresAt },
            create: { userId, courseId, paymentId: payment.id, expiresAt },
          });
        }
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    logger.error("Webhook emal edilərkən xəta", err);
    // Stripe eyni event-i yenidən göndərsin deyə 500 qaytarırıq.
    return res.status(500).json({ error: "Webhook emalı uğursuz oldu." });
  }
}

/**
 * GET /api/payments/me
 */
async function getMyPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { include: { plan: true } },
        coursePurchase: { include: { course: { select: { id: true, title: true } } } },
      },
    });

    res.json(payments);
  } catch (err) {
    logger.error("İstifadəçi ödənişləri alınarkən xəta", err);
    res.status(500).json({
      error: "Serverdə xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.",
    });
  }
}

module.exports = {
  createCheckout,
  handleWebhook,
  getMyPayments,
  addMonths,
  addYears,
  parsePositiveInteger,
};