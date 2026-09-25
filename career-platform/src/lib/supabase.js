import {
  createClient,
} from "@supabase/supabase-js";

let supabaseClient = null;

export function getSupabaseClient() {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL;

  const publishableKey =
    import.meta.env
      .VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Supabase Storage konfiqurasiyası tamamlanmayıb.",
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      supabaseUrl,
      publishableKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return supabaseClient;
}

export function getVideoBucket() {
  return (
    import.meta.env
      .VITE_SUPABASE_VIDEO_BUCKET ||
    "course-videos"
  );
}