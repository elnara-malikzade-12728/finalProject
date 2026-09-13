const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  isCompletionAdvanceAllowed,
} = require('../src/controllers/courseController');

test('completion advance follows elapsed heartbeat time with a small jitter allowance', () => {
  assert.equal(isCompletionAdvanceAllowed(870, 880, 7), true);
  assert.equal(isCompletionAdvanceAllowed(870, 881, 7), false);
  assert.equal(isCompletionAdvanceAllowed(870, 869, 30), false);
});

test('completion endpoint never accepts a client completed flag', () => {
  const routes = fs.readFileSync(path.join(__dirname, '../src/routes/courses.js'), 'utf8');
  const controller = fs.readFileSync(path.join(__dirname, '../src/controllers/courseController.js'), 'utf8');
  assert.match(routes, /router\.post\('\/lessons\/:id\/complete', auth, controller\.completeLessonVideo\)/);
  assert.match(controller, /const lastPositionSeconds = Number\(req\.body\.lastPositionSeconds\)/);
  assert.doesNotMatch(controller, /req\.body\.completed/);
  assert.match(controller, /if \(!existing\?\.lastHeartbeatAt\)/);
  assert.match(controller, /if \(!isPlaybackComplete\(safePosition, durationSeconds\)\)/);
});
