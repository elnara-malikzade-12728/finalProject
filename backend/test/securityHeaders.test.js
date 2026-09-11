const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
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

test("Docker frontend sends the browser hardening headers reported by ZAP", () => {
  const nginxConfig = fs.readFileSync(
    path.join(__dirname, "../../career-platform/nginx.test.conf"),
    "utf8",
  );

  assert.match(nginxConfig, /server_tokens off;/);
  assert.match(nginxConfig, /Content-Security-Policy .*frame-ancestors 'none'/);
  assert.doesNotMatch(nginxConfig, /style-src[^;]*'unsafe-inline'/);
  assert.match(nginxConfig, /report-to csp-endpoint/);
  assert.match(nginxConfig, /Reporting-Endpoints/);
  assert.doesNotMatch(nginxConfig, /Access-Control-Allow-Origin "\*"/);
  assert.match(nginxConfig, /X-Frame-Options "DENY" always;/);
  assert.match(nginxConfig, /X-Content-Type-Options "nosniff" always;/);
  assert.match(nginxConfig, /proxy_set_header X-Forwarded-For \$remote_addr;/);
  assert.doesNotMatch(nginxConfig, /proxy_add_x_forwarded_for/);
});

test("Vercel frontend sends the browser hardening headers in production", () => {
  const config = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../../career-platform/vercel.json"),
    "utf8",
  ));
  const headers = Object.fromEntries(
    config.headers[0].headers.map(({ key, value }) => [key.toLowerCase(), value]),
  );

  assert.match(headers["content-security-policy"], /frame-ancestors 'none'/);
  assert.doesNotMatch(headers["content-security-policy"], /style-src[^;]*'unsafe-inline'/);
  assert.match(headers["content-security-policy"], /report-to csp-endpoint/);
  assert.match(headers["reporting-endpoints"], /csp-endpoint=/);
  assert.equal(headers["access-control-allow-origin"], "https://karyerayol.vercel.app");
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.match(headers["strict-transport-security"], /max-age=31536000/);
});

test("API responses are not stored by shared or browser caches", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/route-that-does-not-exist`);
    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

test("CSP reporting endpoint accepts browser reports without authentication", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/security/csp-report`, {
      method: "POST",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({ "csp-report": { "violated-directive": "script-src" } }),
    });

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");
  });
});
