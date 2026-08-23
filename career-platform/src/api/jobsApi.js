import { USE_MOCK_API } from "../config/env.js";
import { careers as mockCareers } from "../data/careers.js";
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
    location = "",
  } = filters;

  const normalizedSearch = search
    .trim()
    .toLocaleLowerCase("az");
  const normalizedLocation = location
    .trim()
    .toLocaleLowerCase("az");
  const normalizedCareerId = careerId
    ? String(careerId)
    : "";

  return mockJobs.filter((job) => {
    const careerTitle = mockCareers.find(
      (career) => career.id === job.careerId,
    )?.title;

    const matchesSearch =
      !normalizedSearch ||
      [
        job.title,
        job.company,
        job.location,
        careerTitle,
        job.description,
      ]
        .join(" ")
        .toLocaleLowerCase("az")
        .includes(normalizedSearch);

    const matchesCareer =
      !normalizedCareerId ||
      String(job.careerId) === normalizedCareerId;

    const matchesCategory =
      !category ||
      category === "Hamısı" ||
      careerTitle === category;

    const matchesLocation =
      !normalizedLocation ||
      job.location
        .toLocaleLowerCase("az")
        .includes(normalizedLocation);

    return (
      matchesSearch &&
      matchesCareer &&
      matchesCategory &&
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
    const job = mockJobs.find(
      (item) => String(item.id) === String(jobId),
    );

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