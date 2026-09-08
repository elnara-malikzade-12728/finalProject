const test = require('node:test');
const assert = require('node:assert/strict');
const { secureUrl } = require('../src/controllers/lessonResourceController');
const { autoForwardCvForCourseCompletion } = require('../src/services/careerApplicationService');

test('lesson materials accept HTTPS and reject unsafe URL schemes', () => {
  assert.equal(secureUrl('https://example.com/lesson.pdf'), 'https://example.com/lesson.pdf');
  assert.equal(secureUrl('http://example.com/lesson.pdf'), null);
  assert.equal(secureUrl('javascript:alert(1)'), null);
});

test('automatic CV forwarding does nothing without explicit opt-in', async () => {
  let createCalled = false;
  const db = {
    user: { findUnique: async () => ({ cvFilePath: 'private/cv.pdf', careerAutoApplyEnabled: false }) },
    job: { findMany: async () => [{ id: 3 }] },
    application: { createMany: async () => { createCalled = true; return { count: 1 }; } },
  };
  const result = await autoForwardCvForCourseCompletion(1, 2, db);
  assert.equal(result.created, 0);
  assert.equal(createCalled, false);
});

test('automatic CV forwarding uses course jobs and duplicate-safe insertion', async () => {
  let received;
  const db = {
    user: { findUnique: async () => ({ cvFilePath: 'private/cv.pdf', careerAutoApplyEnabled: true }) },
    job: { findMany: async ({ where }) => { assert.deepEqual(where, { courseId: 7 }); return [{ id: 10 }, { id: 11 }]; } },
    application: { createMany: async (payload) => { received = payload; return { count: 2 }; } },
  };
  const result = await autoForwardCvForCourseCompletion(5, 7, db);
  assert.equal(result.created, 2);
  assert.equal(received.skipDuplicates, true);
  assert.deepEqual(received.data.map((item) => item.source), ['AUTOMATIC', 'AUTOMATIC']);
});
