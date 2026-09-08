const { waitUntil } = require("@vercel/functions");

function scheduleBackgroundTask(taskPromise, waitUntilImpl = process.env.VERCEL ? waitUntil : null) {
  if (waitUntilImpl) waitUntilImpl(taskPromise);
}

module.exports = { scheduleBackgroundTask };
