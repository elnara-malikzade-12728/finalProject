import { apiRequest } from "./client.js";

export async function getPlans({ signal } = {}) {
  return apiRequest("/plans", {
    authenticated: true,
    signal,
  });
}

export async function createPlan(planData, { signal } = {}) {
  return apiRequest("/plans", {
    method: "POST",
    body: planData,
    authenticated: true,
    signal,
  });
}

export async function updatePlan(planId, planData, { signal } = {}) {
  return apiRequest(`/plans/${planId}`, {
    method: "PATCH",
    body: planData,
    authenticated: true,
    signal,
  });
}

export async function deletePlan(planId, { signal } = {}) {
  return apiRequest(`/plans/${planId}`, {
    method: "DELETE",
    authenticated: true,
    signal,
  });
}