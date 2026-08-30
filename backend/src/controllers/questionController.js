const prisma = require("../lib/prisma");
const { normalizePositiveInt, buildQuestionPayload } = require("./testController");

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function ensureQuestionExists(id) {
    const question = await prisma.question.findUnique({ where: { id } });

    if (!question) {
        throw createHttpError(404, "Question tapılmadı.");
    }

    return question;
}

async function ensureTestOwnership(testId) {
    const test = await prisma.test.findUnique({ where: { id: testId } });

    if (!test) {
        throw createHttpError(404, "Test tapılmadı.");
    }

    return test;
}

async function createQuestion(req, res, next) {
    try {
        const testId = normalizePositiveInt(req.params.id, "id");
        const test = await ensureTestOwnership(testId);
        const payload = buildQuestionPayload(req.body);

        const totalCount = await prisma.question.count({ where: { testId } });
        const nextTotalCount = totalCount + 1;

        if (test.type === "LESSON" && (nextTotalCount < 3 || nextTotalCount > 5)) {
            throw createHttpError(400, "Lesson testləri 3 ilə 5 sual arasında olmalıdır.");
        }

        if (test.type === "FINAL" && (nextTotalCount < 20 || nextTotalCount > 30)) {
            throw createHttpError(400, "Final testlər 20 ilə 30 sual arasında olmalıdır.");
        }

        const question = await prisma.question.create({
            data: {
                testId,
                questionText: payload.questionText,
                options: payload.options,
                correctValue: payload.correctValue,
                order: payload.order,
            },
        });

        return res.status(201).json(question);
    } catch (error) {
        return next(error);
    }
}

async function updateQuestion(req, res, next) {
    try {
        const questionId = normalizePositiveInt(req.params.id, "id");
        await ensureQuestionExists(questionId);

        const updates = {};
        const body = req.body || {};

        if (body.questionText !== undefined) {
            if (typeof body.questionText !== "string" || !body.questionText.trim()) {
                throw createHttpError(400, "questionText must be a non-empty string.");
            }
            updates.questionText = body.questionText.trim();
        }

        if (body.options !== undefined) {
            if (!Array.isArray(body.options) || body.options.length < 2) {
                throw createHttpError(400, "options must be an array with at least 2 elements.");
            }
            updates.options = body.options.map((item) => String(item));
        }

        if (body.correctValue !== undefined) {
            const value = body.correctValue;
            if (
                typeof value !== "string" &&
                typeof value !== "number" &&
                typeof value !== "boolean"
            ) {
                throw createHttpError(400, "correctValue is invalid.");
            }
            updates.correctValue = value;
        }

        if (body.order !== undefined) {
            const parsed = Number(body.order);
            if (!Number.isInteger(parsed) || parsed < 1) {
                throw createHttpError(400, "order must be a positive integer.");
            }
            updates.order = parsed;
        }

        if (Object.keys(updates).length === 0) {
            throw createHttpError(400, "Yeniləmək üçün ən azı bir sahə göndərməlisiniz.");
        }

        const updated = await prisma.question.update({
            where: { id: questionId },
            data: updates,
        });

        return res.status(200).json(updated);
    } catch (error) {
        return next(error);
    }
}

async function deleteQuestion(req, res, next) {
    try {
        const questionId = normalizePositiveInt(req.params.id, "id");
        await ensureQuestionExists(questionId);

        await prisma.question.delete({ where: { id: questionId } });
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

async function reorderQuestions(req, res, next) {
    try {
        const testId = normalizePositiveInt(req.params.id, "id");
        await ensureTestOwnership(testId);

        if (!Array.isArray(req.body) || req.body.length === 0) {
            throw createHttpError(400, "ordered question ids array is required.");
        }

        const ids = req.body.map((value) => normalizePositiveInt(value, "question id"));
        const existing = await prisma.question.findMany({
            where: { testId },
            select: { id: true },
        });

        if (ids.length !== existing.length) {
            throw createHttpError(400, "Question sıralaması testin bütün suallarını ehtiva etməlidir.");
        }

        const validIds = new Set(existing.map((item) => item.id));
        const invalid = ids.some((id) => !validIds.has(id));

        if (invalid) {
            throw createHttpError(400, "One or more question ids do not belong to this test.");
        }

        const updates = ids.map((id, index) => ({
            where: { id },
            data: { order: index + 1 },
        }));

        await prisma.$transaction(
            updates.map((entry) => prisma.question.update(entry)),
        );

        return res.status(200).json({ message: "Question order updated successfully." });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
};
