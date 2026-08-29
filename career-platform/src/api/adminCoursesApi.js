import { apiRequest } from './client.js';

export const getCourseStructure = (options) => apiRequest('/courses/admin', options);
export const createCategory = (body) => apiRequest('/courses/categories', { method: 'POST', body });
export const deleteCategory = (id) => apiRequest(`/courses/categories/${id}`, { method: 'DELETE' });
export const createCourse = (body) => apiRequest('/courses', { method: 'POST', body });
export const updateCourse = (id, body) => apiRequest(`/courses/${id}`, { method: 'PATCH', body });
export const deleteCourse = (id) => apiRequest(`/courses/${id}`, { method: 'DELETE' });
export const createModule = (courseId, body) => apiRequest(`/courses/${courseId}/modules`, { method: 'POST', body });
export const deleteModule = (id) => apiRequest(`/courses/modules/${id}`, { method: 'DELETE' });
export const createLesson = (moduleId, body) => apiRequest(`/courses/modules/${moduleId}/lessons`, { method: 'POST', body });
export const deleteLesson = (id) => apiRequest(`/courses/lessons/${id}`, { method: 'DELETE' });
