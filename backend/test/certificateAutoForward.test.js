const test = require("node:test");
const assert = require("node:assert/strict");

const { createCertificateForUser } = require("../src/services/certificateService");

test("viewing an existing certificate does not trigger automatic applications", async () => {
  const existing = { id: 10, userId: 1, courseId: 2 };
  let forwardCalls = 0;
  const result = await createCertificateForUser(1, 2, {
    db: { certificate: { findFirst: async () => existing } },
    autoForward: async () => { forwardCalls += 1; },
  });

  assert.equal(result, existing);
  assert.equal(forwardCalls, 0);
});

test("a concurrent certificate creation does not trigger automatic applications twice", async () => {
  const winner = { id: 11, userId: 1, courseId: 2 };
  let certificateLookups = 0;
  let forwardCalls = 0;
  const db = {
    enrollment: { findUnique: async () => ({ id: 1 }) },
    subscription: { findFirst: async () => ({ id: 1 }) },
    coursePurchase: { findFirst: async () => null },
    certificate: {
      findFirst: async () => (++certificateLookups === 1 ? null : winner),
      create: async () => { throw Object.assign(new Error("duplicate"), { code: "P2002" }); },
    },
    course: {
      findUnique: async ({ include, select }) => {
        if (include) return { id: 2, tests: [{ id: 20, passScorePercent: 70 }] };
        if (select?.modules) return { modules: [{ lessons: [{ id: 10, tests: [{ id: 100 }] }] }] };
        return { id: 2, title: "Course" };
      },
    },
    lessonProgress: { count: async () => 1 },
    testAttempt: {
      findFirst: async () => ({ id: 30, score: 90, passed: true }),
      findMany: async () => [{ testId: 100 }],
    },
    user: {
      findUnique: async () => ({ id: 1, name: "User" }),
    },
  };

  const result = await createCertificateForUser(1, 2, {
    db,
    autoForward: async () => { forwardCalls += 1; },
  });

  assert.equal(result, winner);
  assert.equal(forwardCalls, 0);
});
