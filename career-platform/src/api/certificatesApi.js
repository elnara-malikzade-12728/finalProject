import { API_URL } from "../config/env.js";
import { ApiError, apiRequest, getToken } from "./client.js";

export async function getMyCertificates({ signal } = {}) {
    return apiRequest("/certificates/me", {
        authenticated: true,
        signal,
    });
}

export async function verifyCertificate(code, { signal } = {}) {
    return apiRequest(`/certificates/${code}/verify`, {
        authenticated: false,
        signal,
    });
}

export async function downloadCertificate(certificateId, { signal } = {}) {
    const response = await fetch(`${API_URL}/certificates/${certificateId}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        signal,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(body.error || "Sertifikatı yükləmək mümkün olmadı.", response.status, "CERTIFICATE_DOWNLOAD_ERROR");
    }

    return response.blob();
}
