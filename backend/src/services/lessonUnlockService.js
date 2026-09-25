const prisma = require("../lib/prisma");

function computeLessonUnlockState(lessons, completedLessonIds = [], passedTestLessonIds = []) {
  const completed = new Set(completedLessonIds);
  const passedTests = new Set(passedTestLessonIds);
  const lockedLessonIds = [];
  let sequenceUnlocked = true;

  lessons.forEach((lesson, index) => {
    if (index === 0) return;
    const previousLesson = lessons[index - 1];
    const previousRequirementMet = previousLesson.hasPublishedTest
      ? passedTests.has(previousLesson.id)
      : completed.has(previousLesson.id);
    sequenceUnlocked = sequenceUnlocked && previousRequirementMet;
    if (!sequenceUnlocked) lockedLessonIds.push(lesson.id);
  });

  return { lockedLessonIds };
}

async function getCourseLessonUnlockState(userId, courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      modules: {
        orderBy: { order: "asc" },
        select: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
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

  const lessons = course?.modules.flatMap((module) => module.lessons.map((lesson) => ({
    id: lesson.id,
    hasPublishedTest: lesson.tests.length > 0,
  }))) || [];
  if (!lessons.length) return { lockedLessonIds: [] };

  const lessonIds = lessons.map((lesson) => lesson.id);
  const [completedProgress, passedAttempts] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    }),
    prisma.testAttempt.findMany({
      where: {
        userId,
        status: "SUBMITTED",
        passed: true,
        test: { published: true, type: "LESSON", lessonId: { in: lessonIds } },
      },
      select: { test: { select: { lessonId: true } } },
    }),
  ]);

  return computeLessonUnlockState(
    lessons,
    completedProgress.map((item) => item.lessonId),
    passedAttempts.map((item) => item.test.lessonId).filter(Boolean),
  );
}

async function isLessonUnlockedForUser(userId, courseId, lessonId) {
  const { lockedLessonIds } = await getCourseLessonUnlockState(userId, courseId);
  return !lockedLessonIds.includes(lessonId);
}

module.exports = {
  computeLessonUnlockState,
  getCourseLessonUnlockState,
  isLessonUnlockedForUser,
};
