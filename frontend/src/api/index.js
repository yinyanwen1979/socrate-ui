import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const getOutlines = () => api.get('/outlines');
export const getOutline = (slug) => api.get(`/outlines/${slug}`);
export const createOutline = (topic) => api.post('/outlines', { topic });
export const updateOutline = (slug, data) => api.put(`/outlines/${slug}`, data);
export const deleteOutline = (slug) => api.delete(`/outlines/${slug}`);

export const getLessons = () => api.get('/lessons');
export const getLesson = (kpId) => api.get(`/lessons/${kpId}`);
export const generateLesson = (kpId, outlineSlug) => api.post(`/lessons/${kpId}`, { outlineSlug });

export const getQuizzes = () => api.get('/quizzes');
export const getQuiz = (kpId) => api.get(`/quizzes/${kpId}`);
export const generateQuiz = (kpId) => api.post(`/quizzes/${kpId}`);

export const getProgress = () => api.get('/progress');
export const updateProgress = (data) => api.post('/progress', data);

export const runQualityCheck = (topic) => api.get(`/check/${topic}`);

export const getProjects = () => api.get('/projects');

export default api;
