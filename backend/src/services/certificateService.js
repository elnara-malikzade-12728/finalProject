const crypto = require("crypto");
const prisma = require("../lib/prisma");

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function generateCertificateCode() {
    return crypto.randomBytes(16).toString("hex");
}

async function ensureCourseFinalPassed(userId, courseId) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            tests: {
                where: { type: "FINAL", published: true },
                select: { id: true, passScorePercent: true },
            },
        },
    });

    if (!course) {
        throw createHttpError(404, "Kurs tapılmadı.");
    }

    if (!course.tests.length) {
        throw createHttpError(400, "Bu kurs üçün final imtahanı mövcud deyil.");
    }

    const testIds = course.tests.map((test) => test.id);

    const latestSuccessfulAttempt = await prisma.testAttempt.findFirst({
        where: {
            userId,
            testId: { in: testIds },
            status: "SUBMITTED",
            passed: true,
        },
        orderBy: { submittedAt: "desc" },
    });

    if (!latestSuccessfulAttempt) {
        throw createHttpError(403, "Final imtahanı uğurla vermədiyiniz üçün sertifikat verə bilməzsiniz.");
    }

    return { course, latestSuccessfulAttempt };
}

async function createCertificateForUser(userId, courseId) {
    const existing = await prisma.certificate.findFirst({
        where: { userId, courseId },
    });

    if (existing) {
        return existing;
    }

    const { latestSuccessfulAttempt } = await ensureCourseFinalPassed(userId, courseId);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
    });

    if (!user) {
        throw createHttpError(404, "İstifadəçi tapılmadı.");
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true },
    });

    if (!course) {
        throw createHttpError(404, "Kurs tapılmadı.");
    }

    const certificate = await prisma.certificate.create({
        data: {
            code: generateCertificateCode(),
            userId,
            courseId,
            finalScore: latestSuccessfulAttempt.score ?? 0,
        },
    });

    return {
        ...certificate,
        userName: user.name,
        courseTitle: course.title,
    };
}

async function listCertificatesForUser(userId) {
    const eligibleAttempts = await prisma.testAttempt.findMany({
        where: {
            userId,
            status: "SUBMITTED",
            passed: true,
            test: {
                is: { type: "FINAL", published: true, courseId: { not: null } },
            },
        },
        select: { test: { select: { courseId: true } } },
    });

    const courseIds = [...new Set(
        eligibleAttempts.map((attempt) => attempt.test.courseId).filter(Boolean),
    )];

    for (const courseId of courseIds) {
        await createCertificateForUser(userId, courseId);
    }

    return prisma.certificate.findMany({
        where: { userId },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { issuedAt: "desc" },
    });
}

async function getCertificateByCode(code) {
    if (!code || typeof code !== "string") {
        throw createHttpError(400, "Sertifikat kodu düzgün deyil.");
    }

    const certificate = await prisma.certificate.findUnique({
        where: { code },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
            course: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    if (!certificate) {
        throw createHttpError(404, "Sertifikat tapılmadı.");
    }

    return certificate;
}

module.exports = {
    createCertificateForUser,
    listCertificatesForUser,
    getCertificateByCode,
    generateCertificateCode,
    ensureCourseFinalPassed,
};
