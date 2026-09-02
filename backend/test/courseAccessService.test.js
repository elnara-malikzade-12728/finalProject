const test = require("node:test");
const assert = require("node:assert/strict");

const { getFreePreviewLessonIds } = require("../src/services/courseAccessService");

test("only the first two lessons in course order are free previews", () => {
  const modules = [
    { lessons: [{ id: 11 }, { id: 12 }] },
    { lessons: [{ id: 21 }, { id: 22 }] },
  ];

  assert.deepEqual(getFreePreviewLessonIds(modules), [11, 12]);
});

test("free previews continue into the next module when necessary", () => {
  const modules = [
    { lessons: [{ id: 11 }] },
    { lessons: [{ id: 21 }, { id: 22 }] },
  ];

  assert.deepEqual(getFreePreviewLessonIds(modules), [11, 21]);
});
