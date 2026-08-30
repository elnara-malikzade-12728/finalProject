const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { getSupabaseAdmin } = require("../lib/supabase");

function createHttpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeExtension(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
}

function validateCvDocument(fileName, contentType, fileSizeBytes) {
    const extension = normalizeExtension(fileName.split(".").pop());
    const allowedExtensions = new Set(["pdf", "doc", "docx"]);
    const allowedContentTypes = new Set([
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    ]);

    if (!allowedExtensions.has(extension)) {
        throw createHttpError(400, "CV yalnız PDF, DOC və DOCX formatında yüklənə bilər.");
    }

    if (!allowedContentTypes.has(contentType || "")) {
        throw createHttpError(400, "CV faylı üçün düzgün MIME tipi tələb olunur.");
    }

    const maxBytes = 5 * 1024 * 1024;
    if (fileSizeBytes && fileSizeBytes > maxBytes) {
        throw createHttpError(400, "CV faylı 5 MB-dan böyük ola bilməz.");
    }

    return true;
}

async function createCvSignedUrl(supabase, bucket, path) {
    const expiresIn = 300;
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
        throw createHttpError(500, "CV üçün təhlükəsiz baxış keçidi yaratmaq mümkün olmadı.");
    }

    return { signedUrl: data.signedUrl, expiresIn };
}

async function generateCvUploadUrl(req) {
    const { fileName, contentType, fileSizeBytes } = req.body || {};

    if (!fileName || typeof fileName !== "string" || !fileName.trim()) {
        throw createHttpError(400, "fileName tələb olunur.");
    }

    if (typeof contentType !== "string" || !contentType.trim()) {
        throw createHttpError(400, "contentType tələb olunur.");
    }

    const size = Number(fileSizeBytes);
    if (!Number.isFinite(size) || size <= 0) {
        throw createHttpError(400, "fileSizeBytes düzgün olmalıdır.");
    }

    validateCvDocument(fileName, contentType, size);

    const bucket = process.env.SUPABASE_CV_BUCKET || "user-cvs";
    const safeFileName = `${req.user.id}/${crypto.randomUUID()}-${fileName.replace(/\s+/g, "_")}`;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(safeFileName, { upsert: true });

    if (error) {
        throw createHttpError(500, "CV yükləmə URL-i yaradılarkən xəta baş verdi.");
    }

    return {
        uploadUrl: data?.signedUrl,
        token: data?.token,
        path: safeFileName,
        bucket,
        expiresIn: 3600,
        publicUrl: null,
    };
}

async function completeCvUpload(req) {
    const { path, fileName, contentType } = req.body || {};

    if (!path || typeof path !== "string") {
        throw createHttpError(400, "path tələb olunur.");
    }

    if (!fileName || typeof fileName !== "string") {
        throw createHttpError(400, "fileName tələb olunur.");
    }

    if (!path.startsWith(`${req.user.id}/`)) {
        throw createHttpError(403, "Yalnız öz CV faylınızı təsdiqləyə bilərsiniz.");
    }

    const bucket = process.env.SUPABASE_CV_BUCKET || "user-cvs";
    const supabase = getSupabaseAdmin();

    const { signedUrl, expiresIn } = await createCvSignedUrl(supabase, bucket, path);

    await prisma.user.update({
        where: { id: req.user.id },
        data: {
            cvFilePath: path,
            cvOriginalName: fileName,
        },
    });

    const previousPath = req.prismaUser?.cvFilePath;
    if (previousPath && previousPath !== path) {
        await supabase.storage.from(bucket).remove([previousPath]);
    }

    return {
        path,
        fileName,
        contentType: contentType || null,
        publicUrl: signedUrl,
        expiresIn,
    };
}

async function getMyCv(req) {
    const user = req.prismaUser;
    if (!user.cvFilePath) {
        return null;
    }

    const bucket = process.env.SUPABASE_CV_BUCKET || "user-cvs";
    const supabase = getSupabaseAdmin();
    const { signedUrl, expiresIn } = await createCvSignedUrl(supabase, bucket, user.cvFilePath);

    return {
        id: user.id,
        filePath: user.cvFilePath,
        originalName: user.cvOriginalName,
        publicUrl: signedUrl,
        expiresIn,
    };
}

async function deleteMyCv(req) {
    const user = req.prismaUser;
    if (!user.cvFilePath) {
        return { deleted: false };
    }

    const bucket = process.env.SUPABASE_CV_BUCKET || "user-cvs";
    const supabase = getSupabaseAdmin();
    await supabase.storage.from(bucket).remove([user.cvFilePath]);

    await prisma.user.update({
        where: { id: req.user.id },
        data: {
            cvFilePath: null,
            cvOriginalName: null,
        },
    });

    return { deleted: true };
}

module.exports = {
    generateCvUploadUrl,
    completeCvUpload,
    getMyCv,
    deleteMyCv,
    validateCvDocument,
    createCvSignedUrl,
};
