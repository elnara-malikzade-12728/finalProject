const test = require("node:test");
const assert = require("node:assert/strict");
const { createCertificatePdf, formatDate } = require("../src/services/certificatePdfService");

test("certificate PDF contains a valid PDF header and meaningful content", async () => {
  const pdf = await createCertificatePdf({
    code: "test-certificate-code",
    issuedAt: "2026-08-31T12:00:00.000Z",
    finalScore: 92,
    user: { name: "Əli Məmmədov" },
    course: { title: "Kibertəhlükəsizliyin əsasları" },
  }, "https://karyerayol.vercel.app");

  assert.ok(Buffer.isBuffer(pdf));
  assert.ok(pdf.length > 5000);
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
});

test("certificate date uses Azerbaijani day-month-year format", () => {
  assert.match(formatDate("2026-08-31T12:00:00.000Z"), /31\.08\.2026/);
});
