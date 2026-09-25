import { apiRequest } from './client.js';

export const getLessonResources = (lessonId, { signal } = {}) => apiRequest(`/lessons/${lessonId}/resources`, { signal });
export const createLessonResource = (lessonId, body) => apiRequest(`/lessons/${lessonId}/resources`, { method: 'POST', body });
export const updateLessonResource = (id, body) => apiRequest(`/lesson-resources/${id}`, { method: 'PATCH', body });
export const deleteLessonResource = (id) => apiRequest(`/lesson-resources/${id}`, { method: 'DELETE' });
