require('dotenv').config();

const { Client } = require('pg');

const baseUrl = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
const testEmail = `sprint3-e2e-${Date.now()}@local.test`;
const testPassword = 'Sprint3E2ETest123!';
const results = [];
let userToken;
let adminToken;
let userId;
let jobId;

async function request(method, path, body, token, rawBody = false) {
    const headers = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (body !== undefined) headers['content-type'] = 'application/json';

    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : rawBody ? body : JSON.stringify(body),
    });
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = null;
    }
    return { response, data, text };
}

function check(name, actual, expected, detail = '') {
    const passed = actual === expected;
    results.push({ passed, name, detail: `${actual} (expected ${expected})${detail ? ` - ${detail}` : ''}` });
}

function checkTrue(name, value, detail) {
    results.push({ passed: Boolean(value), name, detail: detail || String(value) });
}

async function main() {
    const db = new Client({ connectionString: process.env.DATABASE_URL });
    await db.connect();

    try {
        let result = await request('GET', '/');
        check('GET /', result.response.status, 200);

        result = await request('GET', '/api/docs.json');
        check('GET /api/docs.json', result.response.status, 200);

        result = await request('GET', '/api/jobs');
        check('GET /api/jobs', result.response.status, 200);

        result = await request('GET', '/api/jobs/not-an-id');
        check('Invalid job ID', result.response.status, 400);

        result = await request('GET', '/api/users/me');
        check('Protected route without token', result.response.status, 401);

        result = await request('GET', '/');
        checkTrue('Helmet headers', result.response.headers.get('x-content-type-options') === 'nosniff', 'x-content-type-options=nosniff');
        checkTrue('Rate-limit headers', Boolean(result.response.headers.get('ratelimit-limit') || result.response.headers.get('ratelimit')), 'standard RateLimit header is present');

        result = await request('POST', '/api/auth/register', { name: '', email: 'invalid', password: 'short' });
        check('Invalid registration payload', result.response.status, 400, result.data?.error);
        checkTrue('Registration error message', typeof result.data?.error === 'string' && result.data.error.length > 0);

        result = await request('POST', '/api/auth/register', { name: 'Sprint 3 E2E', email: testEmail, password: testPassword });
        check('Register regular user', result.response.status, 201);
        userToken = result.data?.token;
        userId = result.data?.user?.id;
        checkTrue('Registered role is USER', result.data?.user?.role === 'USER', result.data?.user?.role);

        result = await request('POST', '/api/auth/login', { email: testEmail, password: testPassword });
        check('Login regular user', result.response.status, 200);
        checkTrue('Login returns token', typeof result.data?.token === 'string');

        for (const method of ['POST', 'PATCH', 'DELETE']) {
            result = await request(method, method === 'POST' ? '/api/jobs' : '/api/jobs/1', method === 'POST' ? { title: 'Forbidden', careerId: 1 } : { title: 'Forbidden' }, userToken);
            check(`Regular user ${method} job`, result.response.status, 403);
        }

        result = await request('POST', '/api/auth/register', '{"name":', undefined, true);
        check('Malformed JSON', result.response.status, 400, result.data?.error);
        checkTrue('Malformed JSON error message', typeof result.data?.error === 'string' && result.data.error.length > 0);

        await db.query('UPDATE "User" SET role = $1 WHERE id = $2', ['ADMIN', userId]);
        result = await request('POST', '/api/auth/login', { email: testEmail, password: testPassword });
        check('Login promoted admin', result.response.status, 200);
        adminToken = result.data?.token;
        checkTrue('Promoted role is ADMIN', result.data?.user?.role === 'ADMIN', result.data?.user?.role);

        result = await request('POST', '/api/jobs', { title: 'Sprint 3 E2E Job', careerId: 1, company: 'E2E Test' }, adminToken);
        check('Admin POST /api/jobs', result.response.status, 201, result.data?.error);
        jobId = result.data?.id;
        checkTrue('Created job has ID', Number.isInteger(jobId), String(jobId));

        result = await request('POST', '/api/jobs', { title: '', careerId: 'invalid' }, adminToken);
        check('Invalid job payload', result.response.status, 400, result.data?.error);
        checkTrue('Job validation error message', typeof result.data?.error === 'string' && result.data.error.length > 0);

        result = await request('PATCH', `/api/jobs/${jobId}`, { title: 'Updated Sprint 3 E2E Job' }, adminToken);
        check('Admin PATCH /api/jobs/:id', result.response.status, 200, result.data?.error);

        result = await request('DELETE', `/api/jobs/${jobId}`, undefined, adminToken);
        checkTrue('Admin DELETE /api/jobs/:id', [200, 204].includes(result.response.status), `${result.response.status} (expected 204 or 200)`);
    } finally {
        if (jobId) await db.query('DELETE FROM "Job" WHERE id = $1', [jobId]);
        if (userId) {
            await db.query('DELETE FROM "Progress" WHERE "userId" = $1', [userId]);
            await db.query('DELETE FROM "User" WHERE id = $1', [userId]);
        }
        await db.end();
    }

    console.log('\nSprint 3 E2E checklist');
    for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.name}: ${result.detail}`);
    const failed = results.filter(result => !result.passed);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) process.exitCode = 1;
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});