import { apiRequest } from "./client.js";

/**
 * planId VƏ YA courseId göndər, ikisi birdən yox.
 * Uğurlu olsa backend Stripe checkout URL-i qaytarır — ora yönləndir.
 */
export async function createCheckout({ planId, courseId }, { signal } = {}) {
  return apiRequest("/payments/checkout", {
    method: "POST",
    body: planId ? { planId } : { courseId },
    authenticated: true,
    signal,
  });
}

export async function getMyPayments({ signal } = {}) {
  return apiRequest("/payments/me", {
    authenticated: true,
    signal,
  });
}