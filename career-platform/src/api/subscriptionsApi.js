import { apiRequest } from "./client.js";

export async function getMySubscription({ signal } = {}) {
  return apiRequest("/subscriptions/me", {
    authenticated: true,
    signal,
  });
}

export async function cancelMySubscription({ signal } = {}) {
  return apiRequest("/subscriptions/me/cancel", {
    method: "POST",
    authenticated: true,
    signal,
  });
}

export async function getAllSubscriptions({ signal } = {}) {
  return apiRequest("/admin/subscriptions", {
    authenticated: true,
    signal,
  });
}

export async function getAllPayments({ signal } = {}) {
  return apiRequest("/admin/payments", {
    authenticated: true,
    signal,
  });
}