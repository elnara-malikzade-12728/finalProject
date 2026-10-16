const test = require("node:test");
const assert = require("node:assert/strict");

const { ensureFinalAssessmentAccess } = require("../src/services/finalAssessmentAccessService");

function dbWith({
  enrollment = null,
  subscription = null,
  purchase = null,
  lessons = [{ id: 10, tests: [{ id: 100 }] }],
  completedLessonCount = 1,
  passedTestIds = [100],
} = {}) {
  return {
    enrollment: { findUnique: async () => enrollment },
    subscription: { findFirst: async () => subscription },
    coursePurchase: { findFirst: async () => purchase },
    course: { findUnique: async () => ({ modules: [{ lessons }] }) },
    lessonProgress: { count: async () => completedLessonCount },
    testAttempt: { findMany: async () => passedTestIds.map((testId) => ({ testId })) },
  };
}

test("final assessment rejects users who are not enrolled", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({ subscription: { id: 1 } })),
    (error) => error.statusCode === 403 && /qeydiyyatdan/.test(error.message),
  );
});

test("final assessment rejects enrolled users without a paid entitlement", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({ enrollment: { id: 1 } })),
    (error) => error.statusCode === 403 && /abunəlik/.test(error.message),
  );
});

test("final assessment accepts an active subscription or course purchase", async () => {
  await assert.doesNotReject(ensureFinalAssessmentAccess(1, 2, dbWith({
    enrollment: { id: 1 },
    purchase: { id: 2 },
  })));
});

test("final assessment rejects users with unfinished video lessons", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({
      enrollment: { id: 1 },
      purchase: { id: 2 },
      completedLessonCount: 0,
    })),
    (error) => error.statusCode === 403 && /video dərsləri/.test(error.message),
  );
});

test("final assessment rejects users who have not passed every lesson test", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({
      enrollment: { id: 1 },
      purchase: { id: 2 },
      passedTestIds: [],
    })),
    (error) => error.statusCode === 403 && /dərs testlərindən/.test(error.message),
  );
});
