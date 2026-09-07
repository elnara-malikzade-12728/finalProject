const bcrypt = require("bcrypt");

async function passwordMatchesHash(password, passwordHash) {
  if (typeof password !== "string" || typeof passwordHash !== "string") return false;
  return bcrypt.compare(password, passwordHash);
}

module.exports = { passwordMatchesHash };
