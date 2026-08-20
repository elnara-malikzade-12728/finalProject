import { apiRequest } from "./client.js";

function createQueryString(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL"
    ) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getAdminApplications(
  filters = {},
  { signal } = {},
) {
  const queryString = createQueryString(filters);

  return apiRequest(`/applications${queryString}`, {
    authenticated: true,
    signal,
  });
}

export async function updateApplicationStatus(
  applicationId,
  status,
  { signal } = {},
) {
  return apiRequest(
    `/applications/${applicationId}/status`,
    {
      method: "PATCH",
      body: {
        status,
      },
      authenticated: true,
      signal,
    },
  );
}

export async function deleteApplication(
  applicationId,
  { signal } = {},
) {
  return apiRequest(
    `/applications/${applicationId}`,
    {
      method: "DELETE",
      authenticated: true,
      signal,
    },
  );
}