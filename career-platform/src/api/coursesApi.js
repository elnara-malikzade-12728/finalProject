import { apiRequest } from './client.js';

export const getPublishedCourses = ({ signal } = {}) =>
  apiRequest('/courses', { authenticated: false, signal });

export const getPublishedCourse = (courseId, { signal } = {}) =>
  apiRequest(`/courses/${courseId}`, { authenticated: false, signal });
