import { USE_MOCK_API } from "../config/env.js";
import { careers as mockCareers } from "../data/careers.js";
import { apiRequest } from "./client.js";

export async function getCareers({ signal } = {}) {
  if (USE_MOCK_API) {
    return mockCareers;
  }

  return apiRequest("/careers", {
    authenticated: false,
    signal,
  });
}

export async function getCareerById(
  careerId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    const career = mockCareers.find(
      (item) => item.id === careerId,
    );

    if (!career) {
      throw new Error("Peşə istiqaməti tapılmadı.");
    }

    return career;
  }

  return apiRequest(`/careers/${careerId}`, {
    authenticated: false,
    signal,
  });
}

export async function getCareerRoadmap(
  careerId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    const career = mockCareers.find(
      (item) => item.id === careerId,
    );

    if (!career) {
      throw new Error("Yol xəritəsi tapılmadı.");
    }

    return career.roadmap;
  }

  return apiRequest(`/careers/${careerId}/roadmap`, {
    authenticated: false,
    signal,
  });
}