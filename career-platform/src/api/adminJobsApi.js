import { apiRequest } from "./client.js";

export async function createJob(
  jobData,
  { signal } = {},
) {
  return apiRequest("/jobs", {
    method: "POST",
    body: jobData,
    authenticated: true,
    signal,
  });
}

export async function updateJob(
  jobId,
  jobData,
  { signal } = {},
) {
  return apiRequest(`/jobs/${jobId}`, {
    method: "PATCH",
    body: jobData,
    authenticated: true,
    signal,
  });
}

export async function deleteJob(
  jobId,
  { signal } = {},
) {
  return apiRequest(`/jobs/${jobId}`, {
    method: "DELETE",
    authenticated: true,
    signal,
  });
}