const test = require("node:test");
const assert = require("node:assert/strict");
const { ACCOUNT_DELETION_PHRASE, hasValidAccountDeletionConfirmation } = require("../src/controllers/userController");

test("account deletion requires the exact typed confirmation phrase", () => {
  assert.equal(ACCOUNT_DELETION_PHRASE, "HESABIMI SIL");
  assert.equal(hasValidAccountDeletionConfirmation("HESABIMI SIL"), true);
  assert.equal(hasValidAccountDeletionConfirmation(" HESABIMI SIL "), true);
  assert.equal(hasValidAccountDeletionConfirmation("hesabimi sil"), false);
  assert.equal(hasValidAccountDeletionConfirmation(undefined), false);
});
