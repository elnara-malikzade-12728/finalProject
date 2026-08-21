const {
  createClient,
} = require("@supabase/supabase-js");

let supabaseAdminClient = null;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error(
      "Supabase Storage mühit dəyişənləri konfiqurasiya edilməyib.",
    );

    error.code = "SUPABASE_CONFIG_MISSING";
    throw error;
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return supabaseAdminClient;
}

function getVideoBucket() {
  return (
    process.env.SUPABASE_VIDEO_BUCKET ||
    "course-videos"
  );
}

function getVideoSignedUrlTtl() {
  const configuredTtl = Number(
    process.env.VIDEO_SIGNED_URL_TTL,
  );

  if (
    Number.isInteger(configuredTtl) &&
    configuredTtl >= 60 &&
    configuredTtl <= 3600
  ) {
    return configuredTtl;
  }

  return 600;
}

module.exports = {
  getSupabaseAdmin,
  getVideoBucket,
  getVideoSignedUrlTtl,
};