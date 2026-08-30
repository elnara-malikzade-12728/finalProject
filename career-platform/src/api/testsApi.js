import { apiRequest } from "./client.js";

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
