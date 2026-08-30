import { apiRequest } from "./client.js";

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
