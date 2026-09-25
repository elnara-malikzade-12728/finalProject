import { API_URL } from "../config/env.js";

const TOKEN_KEY = "career_platform_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenRemainingSeconds() {
  const token = getToken();
  if (!token) return 0;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return 0;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(window.atob(padded));
    if (!Number.isFinite(payload.exp)) return 0;
    return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
  } catch {
    return 0;
  }
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status, code, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers = {},
    signal,
    authenticated = true,
  } = {},
) {
  const token = getToken();

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (authenticated && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "Serverlə əlaqə yaratmaq mümkün olmadı.",
      0,
      "NETWORK_ERROR",
    );
  }

  let responseBody = null;

  if (response.status !== 204) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = {
        message: await response.text(),
      };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }

    throw new ApiError(
      responseBody?.message || responseBody?.error || "Sorğu yerinə yetirilə bilmədi.",
      response.status,
      responseBody?.code || "API_ERROR",
      responseBody?.errors || [],
    );
  }

  /*
   * Supports both:
   * { success: true, data: ... }
   * and direct JSON responses.
   */
  if (
    responseBody &&
    typeof responseBody === "object" &&
    Object.prototype.hasOwnProperty.call(responseBody, "data")
  ) {
    return responseBody.data;
  }

  return responseBody;
}

export function getApiErrorMessage(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Gözlənilməz xəta baş verdi.";
}
