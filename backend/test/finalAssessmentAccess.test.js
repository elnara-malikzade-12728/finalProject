const test = require("node:test");
const assert = require("node:assert/strict");

const { ensureFinalAssessmentAccess } = require("../src/services/finalAssessmentAccessService");

function dbWith({ enrollment = null, subscription = null, purchase = null } = {}) {
  return {
    enrollment: { findUnique: async () => enrollment },
    subscription: { findFirst: async () => subscription },
    coursePurchase: { findFirst: async () => purchase },
  };
}

test("final assessment rejects users who are not enrolled", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({ subscription: { id: 1 } })),
    (error) => error.statusCode === 403 && /qeydiyyatdan/.test(error.message),
  );
});

test("final assessment rejects enrolled users without a paid entitlement", async () => {
  await assert.rejects(
    ensureFinalAssessmentAccess(1, 2, dbWith({ enrollment: { id: 1 } })),
    (error) => error.statusCode === 403 && /abunəlik/.test(error.message),
  );
});

test("final assessment accepts an active subscription or course purchase", async () => {
  await assert.doesNotReject(ensureFinalAssessmentAccess(1, 2, dbWith({
    enrollment: { id: 1 },
    purchase: { id: 2 },
  })));
});
