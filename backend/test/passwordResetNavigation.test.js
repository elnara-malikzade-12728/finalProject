const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const resetPageSource = fs.readFileSync(
  path.join(__dirname, "../../career-platform/src/pages/ResetPasswordPage.jsx"),
  "utf8",
);

test("successful password reset clears the invalidated session and returns to login", () => {
  assert.match(resetPageSource, /await resetPasswordWithToken\(token, password\)/);
  assert.match(resetPageSource, /removeToken\(\)/);
  assert.match(resetPageSource, /navigate\("\/login", \{[\s\S]*replace: true/);
  assert.match(resetPageSource, /message: result\.message/);
});
