const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizePositiveInt,
    normalizePercent,
    buildQuestionPayload,
} = require("../src/controllers/testController");
const { createCvSignedUrl } = require("../src/services/cvStorageService");

test("normalizePositiveInt accepts only positive integers", () => {
    assert.equal(normalizePositiveInt("12", "lessonId"), 12);
    assert.throws(() => normalizePositiveInt("0", "lessonId"), /positive integer/);
    assert.throws(() => normalizePositiveInt("abc", "timeLimitMinutes"), /positive integer/);
});

test("normalizePercent enforces valid score bounds", () => {
    assert.equal(normalizePercent("70"), 70);
    assert.equal(normalizePercent(0), 0);
    assert.throws(() => normalizePercent(101), /between 0 and 100/);
    assert.throws(() => normalizePercent(-1), /between 0 and 100/);
});

test("buildQuestionPayload validates and normalizes question fields", () => {
    const payload = buildQuestionPayload({
        questionText: "  Which one is valid? ",
        options: ["A", "B", "C", "D"],
        correctValue: "B",
        order: "2",
    });

    assert.deepEqual(payload, {
        questionText: "Which one is valid?",
        options: ["A", "B", "C", "D"],
        correctValue: "B",
        order: 2,
    });

    assert.throws(() => buildQuestionPayload({ options: ["A"] }), /questionText/);
    assert.throws(() => buildQuestionPayload({ questionText: "Q", options: ["A"] }), /at least 2/);
});

test("createCvSignedUrl returns a short-lived private link", async () => {
    const supabase = {
        storage: {
            from: () => ({
                createSignedUrl: async (path, expiresIn) => ({
                    data: { signedUrl: `https://storage.test/${path}?token=signed` },
                    error: null,
                    expiresIn,
                }),
            }),
        },
    };

    const result = await createCvSignedUrl(supabase, "user-cvs", "7/cv.pdf");
    assert.equal(result.expiresIn, 300);
    assert.match(result.signedUrl, /token=signed/);
});

test("createCvSignedUrl rejects storage signing failures", async () => {
    const supabase = {
        storage: {
            from: () => ({
                createSignedUrl: async () => ({ data: null, error: new Error("storage unavailable") }),
            }),
        },
    };

    await assert.rejects(
        createCvSignedUrl(supabase, "user-cvs", "7/cv.pdf"),
        /təhlükəsiz baxış keçidi/,
    );
});
