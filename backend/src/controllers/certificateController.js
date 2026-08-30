const prisma = require("../lib/prisma");
const { listCertificatesForUser, getCertificateByCode } = require("../services/certificateService");
function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function getMyCertificates(req, res, next) {
    try {
        const certificates = await listCertificatesForUser(req.user.id);
        return res.status(200).json(certificates);
    } catch (error) {
        return next(error);
    }
}

async function verifyCertificate(req, res, next) {
    try {
        const certificate = await getCertificateByCode(req.params.code);

        return res.status(200).json({
            valid: true,
            code: certificate.code,
            issuedAt: certificate.issuedAt,
            finalScore: certificate.finalScore,
            user: {
                id: certificate.user.id,
                name: certificate.user.name,
            },
            course: {
                id: certificate.course.id,
                title: certificate.course.title,
            },
        });
    } catch (error) {
        return next(error);
    }
}

async function downloadCertificate(req, res, next) {
    try {
        const certificateId = Number(req.params.id);

        if (!Number.isInteger(certificateId) || certificateId <= 0) {
            throw createHttpError(400, "Sertifikat ID-si düzgün deyil.");
        }

        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: { select: { id: true, name: true } },
                course: { select: { id: true, title: true } },
            },
        });

        if (!certificate) {
            throw createHttpError(404, "Sertifikat tapılmadı.");
        }

        if (req.user.role !== "ADMIN" && certificate.userId !== req.user.id) {
            throw createHttpError(403, "Bu sertifikatə baxma icazəniz yoxdur.");
        }

        return res.status(200).json({
            id: certificate.id,
            code: certificate.code,
            userName: certificate.user.name,
            courseTitle: certificate.course.title,
            finalScore: certificate.finalScore,
            issuedAt: certificate.issuedAt,
            downloadUrl: `/api/certificates/${certificate.id}/download`,
            verificationUrl: `/api/certificates/${certificate.code}/verify`,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getMyCertificates,
    verifyCertificate,
    downloadCertificate,
};
