import { USE_MOCK_API } from "../config/env.js";
import {
  jobCategories,
  jobs as mockJobs,
} from "../data/jobs.js";
import { apiRequest } from "./client.js";

function filterMockJobs(filters = {}) {
  const {
    search = "",
    careerId = "",
    category = "",
    type = "",
    location = "",
  } = filters;

  const normalizedSearch = search
    .trim()
    .toLocaleLowerCase("az");

  return mockJobs.filter((job) => {
    const matchesSearch =
      !normalizedSearch ||
      [
        job.title,
        job.company,
        job.location,
        job.category,
        job.description,
      ]
        .join(" ")
        .toLocaleLowerCase("az")
        .includes(normalizedSearch);

    const matchesCareer =
      !careerId || job.careerId === careerId;

    const matchesCategory =
      !category ||
      category === "Hamısı" ||
      job.category === category;

    const matchesType =
      !type ||
      type === "Hamısı" ||
      (type === "INTERNSHIP"
        ? job.isInternship
        : !job.isInternship);

    const matchesLocation =
      !location ||
      job.location
        .toLocaleLowerCase("az")
        .includes(location.toLocaleLowerCase("az"));

    return (
      matchesSearch &&
      matchesCareer &&
      matchesCategory &&
      matchesType &&
      matchesLocation
    );
  });
}

function createQueryString(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "Hamısı"
    ) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getJobs(
  filters = {},
  { signal } = {},
) {
  if (USE_MOCK_API) {
    return filterMockJobs(filters);
  }

  const queryString = createQueryString(filters);

  return apiRequest(`/jobs${queryString}`, {
    authenticated: false,
    signal,
  });
}

export async function getJobById(
  jobId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    const job = mockJobs.find((item) => item.id === jobId);

    if (!job) {
      throw new Error("Vakansiya tapılmadı.");
    }

    return job;
  }

  return apiRequest(`/jobs/${jobId}`, {
    authenticated: false,
    signal,
  });
}

export async function getJobsByCareer(
  careerId,
  options = {},
) {
  return getJobs(
    {
      careerId,
    },
    options,
  );
}

export function getJobCategories() {
  return jobCategories;
}