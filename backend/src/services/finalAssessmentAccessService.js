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

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      modules: {
        select: {
          lessons: {
            where: { published: true },
            select: {
              id: true,
              tests: {
                where: { published: true, type: "LESSON" },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  const lessons = course?.modules?.flatMap((module) => module.lessons) || [];
  const lessonIds = lessons.map((lesson) => lesson.id);
  const requiredTestIds = lessons.flatMap((lesson) => lesson.tests.map((test) => test.id));

  if (!lessonIds.length) {
    throw createHttpError(403, "Yekun imtahana başlamaq üçün kurs dərsləri mövcud olmalıdır.");
  }

  const [completedLessonCount, passedAttempts] = await Promise.all([
    db.lessonProgress.count({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
    }),
    requiredTestIds.length
      ? db.testAttempt.findMany({
          where: { userId, testId: { in: requiredTestIds }, status: "SUBMITTED", passed: true },
          select: { testId: true },
        })
      : Promise.resolve([]),
  ]);

  if (completedLessonCount !== lessonIds.length) {
    throw createHttpError(403, "Yekun imtahana başlamaq üçün bütün video dərsləri tamamlayın.");
  }

  const passedTestIds = new Set(passedAttempts.map((attempt) => attempt.testId));
  if (requiredTestIds.some((testId) => !passedTestIds.has(testId))) {
    throw createHttpError(403, "Yekun imtahana başlamaq üçün bütün dərs testlərindən keçin.");
  }

  return true;
}

module.exports = { ensureFinalAssessmentAccess };
