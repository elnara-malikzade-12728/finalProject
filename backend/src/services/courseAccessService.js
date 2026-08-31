const prisma = require("../lib/prisma");

/**
 * Ortaq kurs/dərs girişi məntiqi.
 * Elnara öz course/video controller-lərindən bu funksiyaları çağırır.
 * İmzanı (ad, parametr) dəyişəndə ona xəbər ver.
 */

async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

async function hasActiveSubscription(userId) {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });

  return Boolean(subscription);
}

async function hasValidCoursePurchase(userId, courseId) {
  const now = new Date();

  const purchase = await prisma.coursePurchase.findFirst({
    where: {
      userId,
      courseId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });

  return Boolean(purchase);
}

/**
 * İstifadəçinin verilmiş kursa girişi var mı?
 */
async function canAccessCourse(userId, courseId) {
  if (!userId || !courseId) return false;

  if (await isAdmin(userId)) return true;
  if (await hasActiveSubscription(userId)) return true;
  if (await hasValidCoursePurchase(userId, courseId)) return true;

  return false;
}

/**
 * İstifadəçinin verilmiş dərsə (lesson) girişi var mı?
 * Pulsuz preview dərslər hər kəsə açıqdır.
 */
async function canAccessLesson(userId, lessonId) {
  if (!lessonId) return false;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      isFreePreview: true,
      module: {
        select: { courseId: true },
      },
    },
  });

  if (!lesson) return false;
  if (lesson.isFreePreview) return true;
  if (!userId) return false;

  return canAccessCourse(userId, lesson.module.courseId);
}

module.exports = {
  canAccessCourse,
  canAccessLesson,
};