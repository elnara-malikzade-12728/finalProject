const crypto = require("crypto");

function createOneTimeToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hash: hashToken(token) };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

module.exports = { createOneTimeToken, hashToken };
