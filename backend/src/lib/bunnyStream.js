const crypto = require('crypto');

const apiBase = 'https://video.bunnycdn.com';
const tusEndpoint = 'https://video.bunnycdn.com/tusupload';

function getConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID?.trim();
  const apiKey = process.env.BUNNY_STREAM_API_KEY?.trim();
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY?.trim();
  if (!libraryId || !apiKey || !tokenKey) {
    const error = new Error('Bunny Stream mühit dəyişənləri konfiqurasiya edilməyib.');
    error.code = 'BUNNY_STREAM_CONFIG_MISSING';
    throw error;
  }
  return { libraryId, apiKey, tokenKey };
}

async function bunnyRequest(path, options = {}) {
  const { libraryId, apiKey } = getConfig();
  const response = await fetch(`${apiBase}/library/${libraryId}${path}`, {
    ...options,
    headers: { AccessKey: apiKey, 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Bunny Stream sorğusu uğursuz oldu (${response.status}): ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

async function createVideo(title) {
  return bunnyRequest('/videos', { method: 'POST', body: JSON.stringify({ title }) });
}

async function getVideo(videoId) {
  return bunnyRequest(`/videos/${videoId}`);
}

async function deleteVideo(videoId) {
  return bunnyRequest(`/videos/${videoId}`, { method: 'DELETE' });
}

function createTusCredentials(videoId, lifetimeSeconds = 3600) {
  const { libraryId, apiKey } = getConfig();
  const expires = Math.floor(Date.now() / 1000) + lifetimeSeconds;
  const signature = crypto
    .createHash('sha256')
    .update(`${libraryId}${apiKey}${expires}${videoId}`)
    .digest('hex');
  return {
    endpoint: tusEndpoint,
    headers: {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expires),
      VideoId: videoId,
      LibraryId: String(libraryId),
    },
    expiresIn: lifetimeSeconds,
  };
}

function createEmbedUrl(videoId, lifetimeSeconds) {
  const { libraryId, tokenKey } = getConfig();
  const expires = Math.floor(Date.now() / 1000) + lifetimeSeconds;
  const token = crypto
    .createHash('sha256')
    .update(`${tokenKey}${videoId}${expires}`)
    .digest('hex');
  return {
    url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=false&preload=true`,
    expiresIn: lifetimeSeconds,
  };
}

module.exports = { createVideo, getVideo, deleteVideo, createTusCredentials, createEmbedUrl };
