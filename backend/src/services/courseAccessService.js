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

function getFreePreviewLessonIds(modules = [], limit = 2) {
  return modules
    .flatMap((module) => module.lessons || [])
    .slice(0, limit)
    .map((lesson) => lesson.id);
}

async function isFreePreviewLesson(courseId, lessonId) {
  if (!courseId || !lessonId) return false;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      modules: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          lessons: {
            where: { published: true },
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: { id: true },
          },
        },
      },
    },
  });

  return getFreePreviewLessonIds(course?.modules).includes(lessonId);
}

/**
 * İstifadəçinin verilmiş dərsə (lesson) girişi var mı?
 * Hər kursun ilk iki yayımlanmış dərsi hər kəsə açıqdır.
 */
async function canAccessLesson(userId, lessonId) {
  if (!lessonId) return false;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      module: {
        select: { courseId: true },
      },
    },
  });

  if (!lesson) return false;
  if (await isFreePreviewLesson(lesson.module.courseId, lessonId)) return true;
  if (!userId) return false;

  return canAccessCourse(userId, lesson.module.courseId);
}

module.exports = {
  canAccessCourse,
  canAccessLesson,
  getFreePreviewLessonIds,
  isFreePreviewLesson,
};
