const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("API responses use Helmet's restrictive default CSP", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const policy = response.headers.get("content-security-policy");

    assert.equal(response.status, 200);
    assert.ok(policy);
    assert.match(policy, /default-src 'self'/);
    assert.doesNotMatch(policy, /cdn\.jsdelivr\.net/);
  });
});

test("Swagger receives only its required scoped CSP allowances", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/docs`);
    const policy = response.headers.get("content-security-policy");

    assert.equal(response.status, 200);
    assert.ok(policy);
    assert.match(policy, /script-src 'self' 'unsafe-inline' https:\/\/cdn\.jsdelivr\.net/);
    assert.match(policy, /style-src 'self' 'unsafe-inline' https:\/\/cdn\.jsdelivr\.net/);
    assert.match(policy, /connect-src 'self'/);
  });
});
