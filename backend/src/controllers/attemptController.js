const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const { createCertificateForUser } = require("../services/certificateService");
const { canAccessCourse } = require("../services/courseAccessService");

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function parseAttemptId(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isEquivalentAnswer(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

async function ensureTestIsAvailable(testId) {
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!test) {
        throw createHttpError(404, "Test tapılmadı.");
    }

    if (!test.published) {
        throw createHttpError(403, "Bu test yayımlanmayıb.");
    }

    return test;
}

async function startTestAttempt(req, res, next) {
    try {
        if (req.user.role === "ADMIN") {
            throw createHttpError(403, "Administrator test cəhdini başlada bilməz.");
        }

        const testId = parseAttemptId(req.params.id);

        if (!testId) {
            throw createHttpError(404, "Test tapılmadı.");
        }

        const test = await ensureTestIsAvailable(testId);

        if (test.type === "LESSON" && test.lessonId) {
            const lesson = await prisma.lesson.findUnique({
                where: { id: test.lessonId },
                select: { module: { select: { courseId: true } } },
            });
            const [enrollment, progress] = await Promise.all([
                lesson ? prisma.enrollment.findUnique({
                    where: { userId_courseId: { userId: req.user.id, courseId: lesson.module.courseId } },
                    select: { id: true },
                }) : null,
                prisma.lessonProgress.findUnique({
                    where: { userId_lessonId: { userId: req.user.id, lessonId: test.lessonId } },
                    select: { completed: true },
                }),
            ]);
            if (!enrollment) {
                throw createHttpError(403, "Dərs testinə başlamaq üçün kursa qeydiyyatdan keçməlisiniz.");
            }
            if (!(await canAccessCourse(req.user.id, lesson.module.courseId))) {
                throw createHttpError(403, "Dərs testinə başlamaq üçün aktiv abunəlik və ya kurs alışı tələb olunur.");
            }
            if (!progress?.completed) {
                throw createHttpError(403, "Dərs testinə başlamaq üçün əvvəlcə videonu tamamlayın.");
            }
        }

        const activeAttempt = await prisma.testAttempt.findFirst({
            where: {
                userId: req.user.id,
                testId,
                status: "IN_PROGRESS",
            },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        passScorePercent: true,
                        timeLimitMinutes: true,
                        lesson: { select: { id: true, title: true } },
                        course: { select: { id: true, title: true } },
                    },
                },
            },
        });

        if (activeAttempt) {
            return res.status(200).json(activeAttempt);
        }

        if (!test.questions || test.questions.length === 0) {
            throw createHttpError(400, "Bu test üçün sual mövcud deyil.");
        }

        const attempt = await prisma.testAttempt.create({
            data: {
                userId: req.user.id,
                testId,
                status: "IN_PROGRESS",
            },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        passScorePercent: true,
                        timeLimitMinutes: true,
                        published: true,
                        lesson: { select: { id: true, title: true } },
                        course: { select: { id: true, title: true } },
                    },
                },
            },
        });

        return res.status(201).json({
            ...attempt,
            questions: test.questions.map((question) => ({
                id: question.id,
                questionText: question.questionText,
                options: question.options,
                order: question.order,
            })),
        });
    } catch (error) {
        return next(error);
    }
}

async function getAttempt(req, res, next) {
    try {
        const attemptId = parseAttemptId(req.params.id);

        if (!attemptId) {
            throw createHttpError(404, "Cəhd tapılmadı.");
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        passScorePercent: true,
                        timeLimitMinutes: true,
                        published: true,
                        lesson: { select: { id: true, title: true } },
                        course: { select: { id: true, title: true } },
                    },
                },
            },
        });

        if (!attempt) {
            throw createHttpError(404, "Cəhd tapılmadı.");
        }

        if (req.user.role !== "ADMIN" && attempt.userId !== req.user.id) {
            throw createHttpError(403, "Bu cəhdə daxil olmaq icazəniz yoxdur.");
        }

        const questions = await prisma.question.findMany({
            where: { testId: attempt.testId },
            orderBy: { order: "asc" },
            select: {
                id: true,
                questionText: true,
                options: true,
                order: true,
            },
        });

        return res.status(200).json({
            ...attempt,
            questions: questions.map((question) => ({
                id: question.id,
                questionText: question.questionText,
                options: question.options,
                order: question.order,
            })),
        });
    } catch (error) {
        return next(error);
    }
}

async function submitAttempt(req, res, next) {
    try {
        const attemptId = parseAttemptId(req.params.id);

        if (!attemptId) {
            throw createHttpError(404, "Cəhd tapılmadı.");
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: {
                    include: {
                        questions: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
            },
        });

        if (!attempt) {
            throw createHttpError(404, "Cəhd tapılmadı.");
        }

        if (req.user.role !== "ADMIN" && attempt.userId !== req.user.id) {
            throw createHttpError(403, "Bu cəhdə daxil olmaq icazəniz yoxdur.");
        }

        if (attempt.status === "SUBMITTED") {
            throw createHttpError(409, "Bu cəhd artıq göndərilib.");
        }

        const hasTimeLimit = Number.isInteger(attempt.test.timeLimitMinutes) && attempt.test.timeLimitMinutes > 0;
        const elapsedMinutes = (Date.now() - new Date(attempt.startedAt).getTime()) / 60000;

        if (hasTimeLimit && elapsedMinutes > attempt.test.timeLimitMinutes) {
            await prisma.testAttempt.update({
                where: { id: attemptId },
                data: {
                    status: "EXPIRED",
                    passed: false,
                    score: 0,
                    submittedAt: new Date(),
                },
            });

            throw createHttpError(400, "Vaxt limiti bitib, cəhd avtomatik bağlandı.");
        }

        const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

        if (!answers.length) {
            throw createHttpError(400, "Cavablar göndərilməyib.");
        }

        const questionMap = new Map(attempt.test.questions.map((question) => [question.id, question]));
        const preparedAnswers = [];
        let correctCount = 0;

        for (const answerEntry of answers) {
            const questionId = Number(answerEntry?.questionId);
            const question = questionMap.get(questionId);

            if (!question) {
                continue;
            }

            const isCorrect = isEquivalentAnswer(answerEntry?.answer, question.correctValue);

            if (isCorrect) {
                correctCount += 1;
            }

            preparedAnswers.push({
                attemptId,
                questionId: question.id,
                answer: answerEntry?.answer ?? null,
                correct: isCorrect,
            });
        }

        const totalQuestions = attempt.test.questions.length || 1;
        const score = Number(((correctCount / totalQuestions) * 100).toFixed(2));
        const passed = score >= attempt.test.passScorePercent;

        await prisma.$transaction(async (tx) => {
            await tx.testAnswer.deleteMany({
                where: { attemptId },
            });

            await tx.testAnswer.createMany({
                data: preparedAnswers,
            });

            await tx.testAttempt.update({
                where: { id: attemptId },
                data: {
                    score,
                    passed,
                    status: "SUBMITTED",
                    submittedAt: new Date(),
                },
            });
        });

        let certificate = null;
        if (passed && attempt.test.type === "FINAL" && attempt.test.courseId) {
            try {
                certificate = await createCertificateForUser(req.user.id, attempt.test.courseId);
            } catch (certificateError) {
                logger.error("Final testdən sonra sertifikat yaradılarkən xəta", certificateError);
            }
        }

        return res.status(200).json({
            id: attemptId,
            score,
            passed,
            status: "SUBMITTED",
            totalQuestions,
            correctAnswers: correctCount,
            certificate,
        });
    } catch (error) {
        return next(error);
    }
}

async function listMyAttempts(req, res, next) {
    try {
        const attempts = await prisma.testAttempt.findMany({
            where: { userId: req.user.id },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        passScorePercent: true,
                        published: true,
                    },
                },
            },
            orderBy: { startedAt: "desc" },
        });

        return res.status(200).json(attempts);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    startTestAttempt,
    getAttempt,
    submitAttempt,
    listMyAttempts,
};
