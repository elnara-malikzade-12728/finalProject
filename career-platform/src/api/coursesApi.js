import { apiRequest } from './client.js';

export const getPublishedCourses = ({ signal } = {}) =>
  apiRequest('/courses', { authenticated: false, signal });

export const getPublishedCourse = (courseId, { signal } = {}) =>
  apiRequest(`/courses/${courseId}`, { authenticated: false, signal });

export const enrollInCourse = (courseId, { signal } = {}) =>
  apiRequest(`/courses/${courseId}/enroll`, { method: 'POST', authenticated: true, signal });

export const getMyCourseState = (courseId, { signal } = {}) =>
  apiRequest(`/courses/${courseId}/me`, { authenticated: true, signal });

export const updateLessonProgress = (lessonId, watchedPercentage, lastPositionSeconds, { signal } = {}) =>
  apiRequest(`/courses/lessons/${lessonId}/progress`, {
    method: 'PUT', authenticated: true, signal, body: { watchedPercentage, lastPositionSeconds },
  });
