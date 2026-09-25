import { apiRequest } from "./client.js";

export async function submitCorporateInquiry(inquiryData, { signal } = {}) {
  return apiRequest("/corporate-inquiries", {
    method: "POST",
    body: inquiryData,
    authenticated: false,
    signal,
  });
}

export async function getCorporateInquiries({ status } = {}, { signal } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  return apiRequest(`/corporate-inquiries${query}`, {
    authenticated: true,
    signal,
  });
}

export async function updateInquiryStatus(inquiryId, status, { signal } = {}) {
  return apiRequest(`/corporate-inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: { status },
    authenticated: true,
    signal,
  });
}