const prisma = require("../lib/prisma");
const { listCertificatesForUser, getCertificateByCode } = require("../services/certificateService");
const { createCertificatePdf } = require("../services/certificatePdfService");
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

        const pdf = await createCertificatePdf(certificate, process.env.FRONTEND_URL);
        const safeCode = certificate.code.replace(/[^a-zA-Z0-9_-]/g, "");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="synex-certificate-${safeCode}.pdf"`);
        res.setHeader("Content-Length", String(pdf.length));
        return res.status(200).send(pdf);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getMyCertificates,
    verifyCertificate,
    downloadCertificate,
};
