import api from './axios';

// ── Clients ──────────────────────────────────────
export const getMyClients = () => api.get('/clients');
export const getClientById = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const getMyProfile = () => api.get('/clients/me');
export const getClientStats = (clientId) => api.get(`/clients/${clientId}/stats`);

// ── Exercises ────────────────────────────────────
export const getExercises = (params) => api.get('/exercises', { params });

// ── Programs ─────────────────────────────────────
export const getClientPrograms = (clientId) => api.get(`/programs/client/${clientId}`);
export const getActiveProgram = (clientId) => api.get(`/programs/client/${clientId}/active`);
export const createProgram = (data) => api.post('/programs', data);
export const updateProgramDay = (dayId, data) => api.put(`/programs/days/${dayId}`, data);
export const deleteProgram = (id) => api.delete(`/programs/${id}`);

// ── Workout Logs ─────────────────────────────────
export const getWorkoutLogs = (clientId, params) => api.get(`/workout-logs/client/${clientId}`, { params });
export const getTodayLog = (clientId) => api.get(`/workout-logs/client/${clientId}/today`);
export const saveWorkoutLog = (clientId, data) => api.post(`/workout-logs/client/${clientId}`, data);
export const completeWorkout = (logId) => api.put(`/workout-logs/${logId}/complete`);

// ── Meal Plans ───────────────────────────────────
export const getActiveMealPlan = (clientId) => api.get(`/meal-plans/client/${clientId}/active`);
export const createMealPlan = (clientId, data) => api.post(`/meal-plans/client/${clientId}`, data);
export const updateMealPlan = (planId, data) => api.put(`/meal-plans/${planId}`, data);

// ── Food Items ───────────────────────────────────
export const searchFood = (q) => api.get('/food-items', { params: { q } });
export const createFoodItem = (data) => api.post('/food-items', data);

// ── Meal Entries ─────────────────────────────────
export const getDayEntries = (clientId, date) => api.get(`/meal-entries/client/${clientId}/date/${date}`);
export const getDaySummary = (clientId, date) => api.get(`/meal-entries/client/${clientId}/date/${date}/summary`);
export const addMealEntry = (clientId, data) => api.post(`/meal-entries/client/${clientId}`, data);
export const deleteMealEntry = (entryId) => api.delete(`/meal-entries/${entryId}`);

// ── Progress Logs ────────────────────────────────
export const getProgressLogs = (clientId) => api.get(`/progress-logs/client/${clientId}`);
export const addProgressLog = (clientId, data) => api.post(`/progress-logs/client/${clientId}`, data);
export const deleteProgressLog = (logId) => api.delete(`/progress-logs/${logId}`);

// ── Cardio Logs ──────────────────────────────────
export const getCardioLogs = (clientId) => api.get(`/cardio-logs/client/${clientId}`);
export const addCardioLog = (clientId, data) => api.post(`/cardio-logs/client/${clientId}`, data);
export const deleteCardioLog = (logId) => api.delete(`/cardio-logs/${logId}`);

// ── Auth ─────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const clientLogin = (data) => api.post('/auth/client-login', data);

// ── Food Photos ───────────────────────────────
export const uploadFoodPhoto = (formData) => api.post('/food-photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getFoodPhotos = (clientId) => api.get(`/food-photos/client/${clientId}`);
export const deleteFoodPhoto = (id) => api.delete(`/food-photos/${id}`);

export default api;
