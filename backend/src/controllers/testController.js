const prisma = require("../lib/prisma");

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizePositiveInt(value, fieldName = "id") {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw createHttpError(400, `${fieldName} must be a positive integer.`);
    }

    return parsed;
}

function normalizePercent(value) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
        throw createHttpError(400, "passScorePercent must be an integer between 0 and 100.");
    }

    return parsed;
}

function validateTestType(type) {
    const allowed = ["LESSON", "FINAL"];
    const safeType = typeof type === "string" ? type.toUpperCase() : type;

    if (!allowed.includes(safeType)) {
        throw createHttpError(400, "type must be either LESSON or FINAL.");
    }

    return safeType;
}

function buildQuestionPayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw createHttpError(400, "Question payload must be an object.");
    }

    const questionText = typeof payload.questionText === "string"
        ? payload.questionText.trim()
        : "";

    if (!questionText) {
        throw createHttpError(400, "questionText is required.");
    }

    if (!Array.isArray(payload.options) || payload.options.length < 2) {
        throw createHttpError(400, "options must be an array with at least 2 entries.");
    }

    const validCorrectValue =
        typeof payload.correctValue === "string" ||
        typeof payload.correctValue === "number" ||
        typeof payload.correctValue === "boolean";

    if (!validCorrectValue) {
        throw createHttpError(400, "correctValue is invalid.");
    }

    const orderValue = Number(payload.order);

    if (!Number.isInteger(orderValue) || orderValue < 1) {
        throw createHttpError(400, "order must be a positive integer.");
    }

    return {
        questionText,
        options: payload.options.map((item) => String(item)),
        correctValue: payload.correctValue,
        order: orderValue,
    };
}

async function ensureTestExists(id) {
    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            questions: { orderBy: { order: "asc" } },
        },
    });

    if (!test) {
        throw createHttpError(404, "Test tapılmadı.");
    }

    return test;
}

async function ensureCourseOrLessonExists(courseId, lessonId) {
    if (courseId !== null && courseId !== undefined) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw createHttpError(404, "Course tapılmadı.");
        }
    }

    if (lessonId !== null && lessonId !== undefined) {
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            throw createHttpError(404, "Lesson tapılmadı.");
        }
    }
}

async function createTest(req, res, next) {
    try {
        const body = req.body || {};

        if (typeof body.title !== "string" || !body.title.trim()) {
            throw createHttpError(400, "title is required.");
        }

        const type = validateTestType(body.type ?? "LESSON");

        if (body.lessonId !== undefined && body.courseId !== undefined) {
            throw createHttpError(400, "Test həm lesson, həm də course-a aid ola bilməz.");
        }

        const lessonId = body.lessonId == null ? null : normalizePositiveInt(body.lessonId, "lessonId");
        const courseId = body.courseId == null ? null : normalizePositiveInt(body.courseId, "courseId");

        if (lessonId === null && courseId === null) {
            throw createHttpError(400, "Either lessonId or courseId is required.");
        }

        await ensureCourseOrLessonExists(courseId, lessonId);

        const defaultPassScore = type === "FINAL" ? 70 : 60;
        const passScorePercent = body.passScorePercent == null
            ? defaultPassScore
            : normalizePercent(body.passScorePercent);

        const timeLimitMinutes = body.timeLimitMinutes == null
            ? null
            : normalizePositiveInt(body.timeLimitMinutes, "timeLimitMinutes");

        const test = await prisma.test.create({
            data: {
                title: body.title.trim(),
                type,
                lessonId,
                courseId,
                passScorePercent,
                timeLimitMinutes,
                published: Boolean(body.published),
            },
        });

        return res.status(201).json(test);
    } catch (error) {
        return next(error);
    }
}

async function getTest(req, res, next) {
    try {
        const id = normalizePositiveInt(req.params.id, "id");

        const test = await prisma.test.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!test) {
            throw createHttpError(404, "Test tapılmadı.");
        }

        if (!req.user || req.user.role !== "ADMIN") {
            if (!test.published) {
                throw createHttpError(403, "Bu test yayımlanmayıb.");
            }

            return res.status(200).json({
                ...test,
                correctValueHidden: true,
                questions: test.questions.map((question) => ({
                    id: question.id,
                    questionText: question.questionText,
                    options: question.options,
                    order: question.order,
                })),
            });
        }

        return res.status(200).json(test);
    } catch (error) {
        return next(error);
    }
}

async function updateTest(req, res, next) {
    try {
        const id = normalizePositiveInt(req.params.id, "id");
        const existing = await ensureTestExists(id);
        const updates = {};
        const body = req.body || {};

        if (body.title !== undefined) {
            if (typeof body.title !== "string" || !body.title.trim()) {
                throw createHttpError(400, "title must be a non-empty string.");
            }
            updates.title = body.title.trim();
        }

        if (body.type !== undefined) {
            updates.type = validateTestType(body.type);
        }

        if (body.passScorePercent !== undefined) {
            updates.passScorePercent = normalizePercent(body.passScorePercent);
        }

        if (body.timeLimitMinutes !== undefined) {
            updates.timeLimitMinutes = body.timeLimitMinutes == null
                ? null
                : normalizePositiveInt(body.timeLimitMinutes, "timeLimitMinutes");
        }

        if (body.lessonId !== undefined && body.courseId !== undefined) {
            throw createHttpError(400, "Test həm lesson, həm də course-a aid ola bilməz.");
        }

        if (body.lessonId !== undefined) {
            updates.lessonId = normalizePositiveInt(body.lessonId, "lessonId");
            updates.courseId = null;
            await ensureCourseOrLessonExists(null, updates.lessonId);
        }

        if (body.courseId !== undefined) {
            updates.courseId = normalizePositiveInt(body.courseId, "courseId");
            updates.lessonId = null;
            await ensureCourseOrLessonExists(updates.courseId, null);
        }

        if (body.published !== undefined) {
            if (typeof body.published !== "boolean") {
                throw createHttpError(400, "published must be a boolean.");
            }
            updates.published = body.published;
        }

        const updated = await prisma.test.update({
            where: { id },
            data: updates,
            include: { questions: { orderBy: { order: "asc" } } },
        });

        return res.status(200).json(updated);
    } catch (error) {
        return next(error);
    }
}

async function deleteTest(req, res, next) {
    try {
        const id = normalizePositiveInt(req.params.id, "id");
        await ensureTestExists(id);

        await prisma.test.delete({ where: { id } });
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

async function publishTest(req, res, next) {
    try {
        const id = normalizePositiveInt(req.params.id, "id");
        await ensureTestExists(id);

        const publishedValue = req.body && typeof req.body.published === "boolean"
            ? req.body.published
            : true;

        const updated = await prisma.test.update({
            where: { id },
            data: { published: publishedValue },
        });

        return res.status(200).json(updated);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    normalizePositiveInt,
    normalizePercent,
    validateTestType,
    buildQuestionPayload,
    createTest,
    getTest,
    updateTest,
    deleteTest,
    publishTest,
};
