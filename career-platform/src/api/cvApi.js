import { apiRequest } from "./client.js";
import { getSupabaseClient } from "../lib/supabase.js";

export async function requestCvUploadUrl(fileName, contentType, fileSizeBytes, { signal } = {}) {
    return apiRequest("/users/me/cv/upload-url", {
        method: "POST",
        authenticated: true,
        signal,
        body: {
            fileName,
            contentType,
            fileSizeBytes,
        },
    });
}

export async function uploadCvToStorage(uploadCredentials, file) {
    if (!uploadCredentials?.bucket || !uploadCredentials?.path || !uploadCredentials?.token) {
        throw new Error("CV yükləmə məlumatları natamamdır.");
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
        .from(uploadCredentials.bucket)
        .uploadToSignedUrl(
            uploadCredentials.path,
            uploadCredentials.token,
            file,
            {
                contentType: file.type || "application/octet-stream",
                cacheControl: "3600",
            },
        );

    if (error) {
        throw new Error(error.message || "CV-ni Storage xidmətinə yükləmək mümkün olmadı.");
    }
}

export async function completeCvUpload(path, fileName, contentType, { signal } = {}) {
    return apiRequest("/users/me/cv/complete", {
        method: "POST",
        authenticated: true,
        signal,
        body: {
            path,
            fileName,
            contentType,
        },
    });
}

export async function getMyCv({ signal } = {}) {
    const response = await apiRequest("/users/me/cv", {
        authenticated: true,
        signal,
    });

    return response?.cv || response || null;
}

export async function deleteMyCv({ signal } = {}) {
    return apiRequest("/users/me/cv", {
        method: "DELETE",
        authenticated: true,
        signal,
    });
}
