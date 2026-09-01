const test = require("node:test");
const assert = require("node:assert/strict");
const { computeLessonUnlockState } = require("../src/services/lessonUnlockService");

test("the first lesson is unlocked and later lessons require sequential completion", () => {
  const lessons = [
    { id: 1, hasPublishedTest: false },
    { id: 2, hasPublishedTest: false },
    { id: 3, hasPublishedTest: false },
  ];
  assert.deepEqual(computeLessonUnlockState(lessons).lockedLessonIds, [2, 3]);
  assert.deepEqual(computeLessonUnlockState(lessons, [2]).lockedLessonIds, [2, 3]);
  assert.deepEqual(computeLessonUnlockState(lessons, [1]).lockedLessonIds, [3]);
  assert.deepEqual(computeLessonUnlockState(lessons, [1, 2]).lockedLessonIds, []);
});

test("a published lesson test requires a passing attempt instead of video completion", () => {
  const lessons = [
    { id: 10, hasPublishedTest: true },
    { id: 20, hasPublishedTest: false },
  ];
  assert.deepEqual(computeLessonUnlockState(lessons, [10]).lockedLessonIds, [20]);
  assert.deepEqual(computeLessonUnlockState(lessons, [10], [10]).lockedLessonIds, []);
});
