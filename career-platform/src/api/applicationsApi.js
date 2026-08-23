import { USE_MOCK_API } from "../config/env.js";
import {
  ApiError,
  apiRequest,
  getToken,
} from "./client.js";
import { getJobById } from "./jobsApi.js";

const MOCK_APPLICATIONS_KEY =
  "career_platform_job_applications";
const CURRENT_USER_KEY = "career_platform_current_user";

function readMockApplications() {
  try {
    const value = localStorage.getItem(
      MOCK_APPLICATIONS_KEY,
    );

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function getMockUserId() {
  try {
    const value = localStorage.getItem(CURRENT_USER_KEY);
    const user = value ? JSON.parse(value) : null;

    return user?.id || "mock-user";
  } catch {
    return "mock-user";
  }
}

function mockApplyToJob(jobId) {
  if (!getToken()) {
    throw new ApiError(
      "Müraciət etmək üçün hesabınıza daxil olun.",
      401,
      "UNAUTHENTICATED",
    );
  }

  const applications = readMockApplications();
  const userId = getMockUserId();
  const normalizedJobId = String(jobId);

  const alreadyApplied = applications.some(
    (application) =>
      application.userId === userId &&
      String(application.jobId) === normalizedJobId,
  );

  if (alreadyApplied) {
    throw new ApiError(
      "Bu vakansiyaya artıq müraciət etmisiniz.",
      409,
      "CONFLICT",
    );
  }

  const createdApplication = {
    id: `application-${Date.now()}`,
    userId,
    jobId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    MOCK_APPLICATIONS_KEY,
    JSON.stringify([
      ...applications,
      createdApplication,
    ]),
  );

  return createdApplication;
}

export async function applyToJob(
  jobId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    return mockApplyToJob(jobId);
  }

  return apiRequest(`/jobs/${jobId}/apply`, {
    method: "POST",
    authenticated: true,
    signal,
  });
}

async function mockGetMyApplications({ signal } = {}) {
  if (!getToken()) {
    throw new ApiError(
      "Müraciətlərə baxmaq üçün hesabınıza daxil olun.",
      401,
      "UNAUTHENTICATED",
    );
  }

  const userId = getMockUserId();

  const applications = readMockApplications()
    .filter((application) => application.userId === userId)
    .sort(
      (first, second) =>
        new Date(second.createdAt) - new Date(first.createdAt),
    );

  return Promise.all(
    applications.map(async (application) => {
      let job = application.job || null;

      if (!job && application.jobId != null) {
        try {
          job = await getJobById(application.jobId, {
            signal,
          });
        } catch {
          job = null;
        }
      }

      return {
        ...application,
        job: job
          ? {
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
            }
          : null,
      };
    }),
  );
}

export async function getMyApplications({ signal } = {}) {
  if (USE_MOCK_API) {
    return mockGetMyApplications({ signal });
  }

  return apiRequest("/applications/me", {
    authenticated: true,
    signal,
  });
}
