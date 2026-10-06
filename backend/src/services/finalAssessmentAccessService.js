const prisma = require("../lib/prisma");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureFinalAssessmentAccess(userId, courseId, db = prisma) {
  if (!userId || !courseId) {
    throw createHttpError(403, "Yekun imtahana giriş icazəniz yoxdur.");
  }

  const now = new Date();
  const [enrollment, subscription, purchase] = await Promise.all([
    db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    }),
    db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true },
    }),
    db.coursePurchase.findFirst({
      where: {
        userId,
        courseId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true },
    }),
  ]);

  if (!enrollment) {
    throw createHttpError(403, "Yekun imtahana başlamaq üçün kursa qeydiyyatdan keçməlisiniz.");
  }

  if (!subscription && !purchase) {
    throw createHttpError(403, "Yekun imtahana başlamaq üçün aktiv abunəlik və ya kurs alışı tələb olunur.");
  }

  return true;
}

module.exports = { ensureFinalAssessmentAccess };
