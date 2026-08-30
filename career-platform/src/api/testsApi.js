import { apiRequest } from "./client.js";

export const getAdminTests = (options) => apiRequest("/tests", options);
export const getPublishedTests = (options) => apiRequest("/tests/published", { ...options, authenticated: false });
export const createAdminTest = (body) => apiRequest("/tests", { method: "POST", body });
export const deleteAdminTest = (id) => apiRequest(`/tests/${id}`, { method: "DELETE" });
export const setAdminTestPublished = (id, published) => apiRequest(`/tests/${id}/publish`, { method: "PATCH", body: { published } });
export const createAdminQuestion = (testId, body) => apiRequest(`/tests/${testId}/questions`, { method: "POST", body });
export const deleteAdminQuestion = (id) => apiRequest(`/questions/${id}`, { method: "DELETE" });

export async function startTestAttempt(testId, { signal } = {}) {
    return apiRequest(`/tests/${testId}/attempts`, {
        method: "POST",
        authenticated: true,
        signal,
    });
}

export async function getAttempt(attemptId, { signal } = {}) {
    return apiRequest(`/attempts/${attemptId}`, {
        authenticated: true,
        signal,
    });
}

export async function submitAttempt(attemptId, answers, { signal } = {}) {
    return apiRequest(`/attempts/${attemptId}/submit`, {
        method: "POST",
        authenticated: true,
        signal,
        body: { answers },
    });
}

export async function getMyAttempts({ signal } = {}) {
    return apiRequest("/attempts/me", {
        authenticated: true,
        signal,
    });
}

export async function getTestById(testId, { signal } = {}) {
    return apiRequest(`/tests/${testId}`, {
        authenticated: true,
        signal,
    });
}
