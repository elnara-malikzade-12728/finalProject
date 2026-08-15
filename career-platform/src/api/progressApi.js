import { USE_MOCK_API } from "../config/env.js";
import { careers as mockCareers } from "../data/careers.js";
import { apiRequest } from "./client.js";

function getProgressKey(userId, careerId) {
  return `career_platform_progress_${userId}_${careerId}`;
}

function getMockCareer(careerId) {
  return mockCareers.find(
    (career) => career.id === careerId,
  );
}

function readMockCompletedSteps(userId, careerId) {
  try {
    const savedProgress = localStorage.getItem(
      getProgressKey(userId, careerId),
    );

    return savedProgress ? JSON.parse(savedProgress) : [];
  } catch {
    return [];
  }
}

function saveMockCompletedSteps(
  userId,
  careerId,
  completedStepIds,
) {
  localStorage.setItem(
    getProgressKey(userId, careerId),
    JSON.stringify(completedStepIds),
  );
}

function createProgressSummary(
  careerId,
  completedStepIds,
) {
  const career = getMockCareer(careerId);
  const totalSteps = career?.roadmap?.length || 0;
  const completedSteps = completedStepIds.length;

  const percentage =
    totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

  return {
    careerId,
    completedStepIds,
    completedSteps,
    totalSteps,
    percentage,
  };
}

export async function getProgress(
  careerId,
  userId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    const completedStepIds = readMockCompletedSteps(
      userId,
      careerId,
    );

    return createProgressSummary(
      careerId,
      completedStepIds,
    );
  }

  return apiRequest(`/progress/${careerId}`, {
    signal,
  });
}

export async function updateStepProgress(
  {
    stepId,
    careerId,
    userId,
    completed,
  },
  { signal } = {},
) {
  if (USE_MOCK_API) {
    const currentCompletedSteps = readMockCompletedSteps(
      userId,
      careerId,
    );

    const nextCompletedSteps = completed
      ? [...new Set([...currentCompletedSteps, stepId])]
      : currentCompletedSteps.filter(
          (savedStepId) => savedStepId !== stepId,
        );

    saveMockCompletedSteps(
      userId,
      careerId,
      nextCompletedSteps,
    );

    return createProgressSummary(
      careerId,
      nextCompletedSteps,
    );
  }

  return apiRequest(`/progress/${stepId}`, {
    method: "PUT",
    body: {
      completed,
    },
    signal,
  });
}

export async function resetProgress(
  careerId,
  userId,
  { signal } = {},
) {
  if (USE_MOCK_API) {
    localStorage.removeItem(
      getProgressKey(userId, careerId),
    );

    return createProgressSummary(careerId, []);
  }

  return apiRequest(`/progress/${careerId}`, {
    method: "DELETE",
    signal,
  });
}