import { apiRequest } from "./client.js";

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
    return apiRequest(`/certificates/${certificateId}/download`, {
        authenticated: true,
        signal,
    });
}
