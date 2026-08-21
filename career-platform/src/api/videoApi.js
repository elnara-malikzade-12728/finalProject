import { apiRequest } from "./client.js";
import {
  getSupabaseClient,
  getVideoBucket,
} from "../lib/supabase.js";

export async function requestVideoUpload(
  lessonId,
  file,
  { signal } = {},
) {
  return apiRequest(
    `/lessons/${lessonId}/video/upload-url`,
    {
      method: "POST",
      authenticated: true,
      signal,
      body: {
        contentType: file.type,
        sizeBytes: file.size,
      },
    },
  );
}

export async function uploadVideoToStorage(
  uploadCredentials,
  file,
) {
  const supabase = getSupabaseClient();

  const {
    data,
    error,
  } = await supabase.storage
    .from(
      uploadCredentials.bucket ||
        getVideoBucket(),
    )
    .uploadToSignedUrl(
      uploadCredentials.path,
      uploadCredentials.token,
      file,
      {
        contentType: file.type,
        cacheControl: "3600",
      },
    );

  if (error) {
    throw new Error(
      error.message ||
        "Videonu Storage xidmətinə yükləmək mümkün olmadı.",
    );
  }

  return data;
}

export async function completeVideoUpload(
  lessonId,
  {
    path,
    contentType,
    sizeBytes,
    durationSeconds,
  },
  { signal } = {},
) {
  return apiRequest(
    `/lessons/${lessonId}/video/complete`,
    {
      method: "POST",
      authenticated: true,
      signal,
      body: {
        path,
        contentType,
        sizeBytes,
        durationSeconds,
      },
    },
  );
}

export async function uploadLessonVideo(
  lessonId,
  file,
  {
    durationSeconds = null,
    signal,
  } = {},
) {
  const uploadCredentials =
    await requestVideoUpload(
      lessonId,
      file,
      { signal },
    );

  await uploadVideoToStorage(
    uploadCredentials,
    file,
  );

  return completeVideoUpload(
    lessonId,
    {
      path: uploadCredentials.path,
      contentType: file.type,
      sizeBytes: file.size,
      durationSeconds,
    },
    { signal },
  );
}

export async function getLessonVideoUrl(
  lessonId,
  { signal } = {},
) {
  return apiRequest(
    `/lessons/${lessonId}/video`,
    {
      authenticated: true,
      signal,
    },
  );
}

export async function deleteLessonVideo(
  lessonId,
  { signal } = {},
) {
  return apiRequest(
    `/lessons/${lessonId}/video`,
    {
      method: "DELETE",
      authenticated: true,
      signal,
    },
  );
}