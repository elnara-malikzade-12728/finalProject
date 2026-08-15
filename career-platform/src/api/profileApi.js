import { USE_MOCK_API } from "../config/env.js";
import { apiRequest } from "./client.js";

const CURRENT_USER_KEY = "career_platform_current_user";
const USERS_KEY = "career_platform_users";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function updateMockProfile(profileUpdates) {
  const currentUser = readStorage(CURRENT_USER_KEY, null);

  if (!currentUser) {
    throw new Error(
      "Profil məlumatlarını görmək üçün giriş etməlisiniz.",
    );
  }

  const users = readStorage(USERS_KEY, []);

  const updatedUser = {
    ...currentUser,
    ...profileUpdates,

    // These fields cannot be changed from the profile form.
    id: currentUser.id,
    email: currentUser.email,
  };

  const updatedUsers = users.map((savedUser) =>
    savedUser.id === currentUser.id
      ? {
          ...savedUser,
          ...profileUpdates,
          id: savedUser.id,
          email: savedUser.email,
        }
      : savedUser,
  );

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(updatedUser),
  );

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(updatedUsers),
  );

  return updatedUser;
}

export async function getProfile({ signal } = {}) {
  if (USE_MOCK_API) {
    const currentUser = readStorage(CURRENT_USER_KEY, null);

    if (!currentUser) {
      throw new Error(
        "Profil məlumatlarını görmək üçün giriş etməlisiniz.",
      );
    }

    return currentUser;
  }

  return apiRequest("/users/me", {
    signal,
  });
}

export async function updateProfile(
  profileUpdates,
  { signal } = {},
) {
  const normalizedProfile = {
    name: profileUpdates.name?.trim() || "",
    education: profileUpdates.education?.trim() || "",
    location: profileUpdates.location?.trim() || "",
    bio: profileUpdates.bio?.trim() || "",
    interests: Array.isArray(profileUpdates.interests)
      ? profileUpdates.interests
      : [],
    skills: Array.isArray(profileUpdates.skills)
      ? profileUpdates.skills
      : [],
  };

  if (USE_MOCK_API) {
    return updateMockProfile(normalizedProfile);
  }

  return apiRequest("/users/me", {
    method: "PATCH",
    body: normalizedProfile,
    signal,
  });
}