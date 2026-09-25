const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createAuthenticationResponse } = require("../src/controllers/authController");

const testUser = {
  id: "user-1",
  tokenVersion: 0,
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  isCorporate: false,
  education: null,
  location: null,
  bio: null,
  interests: [],
  skills: [],
};

test("authentication tokens expire after one hour by default", () => {
  const previous = process.env.JWT_EXPIRES_IN;
  delete process.env.JWT_EXPIRES_IN;
  try {
    const { token } = createAuthenticationResponse(testUser);
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    assert.equal(payload.exp - payload.iat, 60 * 60);
  } finally {
    if (previous === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = previous;
  }
});

test("authentication token lifetime can be configured", () => {
  const previous = process.env.JWT_EXPIRES_IN;
  process.env.JWT_EXPIRES_IN = "30m";
  try {
    const { token } = createAuthenticationResponse(testUser);
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    assert.equal(payload.exp - payload.iat, 30 * 60);
  } finally {
    if (previous === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = previous;
  }
});
