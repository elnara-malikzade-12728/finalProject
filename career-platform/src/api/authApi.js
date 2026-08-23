import { USE_MOCK_API } from "../config/env.js";
import {
  apiRequest,
  removeToken,
  setToken,
} from "./client.js";

const CURRENT_USER_KEY = "career_platform_current_user";
const USERS_KEY = "career_platform_users";
const MOCK_TOKEN = "mock-authentication-token";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createUserId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}`;
}

function createSafeUser(user) {
  const { password: _password, ...safeUser } = user;

  return safeUser;
}

function saveCurrentUser(user) {
  const safeUser = createSafeUser(user);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(safeUser),
  );

  return safeUser;
}

function mockRegister(userData) {
  const users = readStorage(USERS_KEY, []);
  const normalizedEmail = userData.email
    .trim()
    .toLowerCase();

  const userExists = users.some(
    (user) =>
      user.email.toLowerCase() === normalizedEmail,
  );

  if (userExists) {
    throw new Error(
      "Bu e-poçt ünvanı ilə artıq hesab yaradılıb.",
    );
  }

  const newUser = {
    id: createUserId(),
    name: userData.name.trim(),
    email: normalizedEmail,
    password: userData.password,
    education: "",
    location: "",
    interests: [],
    skills: [],
    bio: "",
  };

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([...users, newUser]),
  );

  const safeUser = saveCurrentUser(newUser);
  setToken(MOCK_TOKEN);

  return {
    token: MOCK_TOKEN,
    user: safeUser,
  };
}

function mockLogin(credentials) {
  const users = readStorage(USERS_KEY, []);
  const normalizedEmail = credentials.email
    .trim()
    .toLowerCase();

  const matchingUser = users.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === credentials.password,
  );

  if (!matchingUser) {
    throw new Error(
      "E-poçt ünvanı və ya şifrə yanlışdır.",
    );
  }

  const safeUser = saveCurrentUser(matchingUser);
  setToken(MOCK_TOKEN);

  return {
    token: MOCK_TOKEN,
    user: safeUser,
  };
}

export async function registerUser(userData) {
  if (USE_MOCK_API) {
    return mockRegister(userData);
  }

  const data = await apiRequest("/auth/register", {
    method: "POST",
    authenticated: false,
    body: {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    },
  });

  if (!data?.token) {
    throw new Error(
      "Server authentication token qaytarmadı.",
    );
  }

  setToken(data.token);

  return data;
}

export async function loginUser(credentials) {
  if (USE_MOCK_API) {
    return mockLogin(credentials);
  }

  const data = await apiRequest("/auth/login", {
    method: "POST",
    authenticated: false,
    body: {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    },
  });

  if (!data?.token) {
    throw new Error(
      "Server authentication token qaytarmadı.",
    );
  }

  setToken(data.token);

  return data;
}

export async function getCurrentUser({ signal } = {}) {
  if (USE_MOCK_API) {
    return readStorage(CURRENT_USER_KEY, null);
  }

  return apiRequest("/users/me", {
    signal,
  });
}

export function logoutUser() {
  removeToken();

  if (USE_MOCK_API) {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
