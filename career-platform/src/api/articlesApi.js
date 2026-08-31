import { apiRequest } from "./client.js";

export async function getArticles({ signal } = {}) {
  return apiRequest("/articles", {
    authenticated: true,
    signal,
  });
}

export async function getArticleBySlug(slug, { signal } = {}) {
  return apiRequest(`/articles/${slug}`, {
    authenticated: false,
    signal,
  });
}

export async function createArticle(articleData, { signal } = {}) {
  return apiRequest("/articles", {
    method: "POST",
    body: articleData,
    authenticated: true,
    signal,
  });
}

export async function updateArticle(articleId, articleData, { signal } = {}) {
  return apiRequest(`/articles/${articleId}`, {
    method: "PATCH",
    body: articleData,
    authenticated: true,
    signal,
  });
}

export async function deleteArticle(articleId, { signal } = {}) {
  return apiRequest(`/articles/${articleId}`, {
    method: "DELETE",
    authenticated: true,
    signal,
  });
}