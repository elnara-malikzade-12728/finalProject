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
    let billingPeriod = "ONE_TIME";

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

      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE", cancelledAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      });
      if (activeSubscription) return res.status(409).json({ error: "Artıq aktiv, avtomatik yenilənən abunəliyiniz var." });

      amount = plan.price;
      currency = plan.currency;
      productName = plan.name;
      metadata = {
        userId: String(user.id),
        type: "subscription",
        planId: String(plan.id),
      };
      billingPeriod = plan.billingPeriod;
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
      billingPeriod,
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
    if (["invoice.paid", "invoice.payment_failed"].includes(event.type)) {
      const invoice = event.data.object;
      const providerSubscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
      if (!providerSubscriptionId) return res.status(200).json({ received: true });
      const subscription = await prisma.subscription.findUnique({ where: { providerReference: providerSubscriptionId } });
      if (!subscription) return res.status(200).json({ received: true });
      const paid = event.type === "invoice.paid";
      const periodEnd = invoice.lines?.data?.reduce((latest, line) => Math.max(latest, line.period?.end || 0), 0);
      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({ where: { id: subscription.id }, data: { status: paid ? "ACTIVE" : "PAYMENT_FAILED", ...(periodEnd ? { expiresAt: new Date(periodEnd * 1000) } : {}) } });
        if (invoice.billing_reason !== "subscription_create") {
          await tx.payment.upsert({
            where: { providerReference: invoice.id },
            update: { status: paid ? "SUCCEEDED" : "FAILED" },
            create: { userId: subscription.userId, subscriptionId: subscription.id, providerReference: invoice.id, amount: (invoice.amount_paid || invoice.amount_due || 0) / 100, currency: (invoice.currency || "azn").toUpperCase(), status: paid ? "SUCCEEDED" : "FAILED" },
          });
        }
      });
      return res.status(200).json({ received: true });
    }

    if (event.type === "customer.subscription.deleted") {
      const providerSubscription = event.data.object;
      await prisma.subscription.updateMany({
        where: { providerReference: providerSubscription.id },
        data: { status: "CANCELLED", cancelledAt: new Date(), expiresAt: new Date((providerSubscription.current_period_end || Math.floor(Date.now() / 1000)) * 1000) },
      });
      return res.status(200).json({ received: true });
    }

    if (event.type !== "checkout.session.completed") return res.status(200).json({ received: true });

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
          const providerSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          const providerSubscription = providerSubscriptionId ? await paymentService.getProviderSubscription(providerSubscriptionId) : null;
          const expiresAt = providerSubscription?.current_period_end
            ? new Date(providerSubscription.current_period_end * 1000)
            : plan.billingPeriod === "YEARLY" ? addYears(now, 1) : addMonths(now, 1);

          const subscription = await tx.subscription.upsert({
            where: { providerReference: providerSubscriptionId || `checkout:${session.id}` },
            update: { status: "ACTIVE", expiresAt, cancelledAt: null },
            create: {
              userId,
              planId: plan.id,
              providerCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
              providerReference: providerSubscriptionId || `checkout:${session.id}`,
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
