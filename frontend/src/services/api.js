import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add Authorization header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle token refresh or redirect to login on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
          localStorage.setItem('token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return API(originalRequest);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => API.post('/auth/login/', { email, password }),
  register: (userData) => API.post('/auth/register/', userData),
  getProfile: () => API.get('/auth/profile/'),
  updateProfile: (profileData) => API.put('/auth/profile/', profileData),
  updateAvatar: (formData) => API.patch('/auth/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const calculatorAPI = {
  calculateBMI: (weight_kg, height_cm) => API.post('/calculate/bmi/', { weight_kg, height_cm }),
  calculateWater: (weight_kg, activity_level) => API.post('/calculate/water-intake/', { weight_kg, activity_level }),
  calculateDietPlan: (data) => API.post('/calculate/diet-plan/', data),
};

export const foodAPI = {
  searchFoods: (query) => API.get(`/food/search/?q=${query}`),
  getFoodCategories: () => API.get('/food/categories/'),
  createCustomFood: (foodData) => API.post('/food/custom/', foodData),
};

export const trackingAPI = {
  getFoodLog: (date) => API.get(`/tracking/log/?date=${date}`),
  addFoodLog: (data) => API.post('/tracking/log/', data),
  deleteFoodLog: (id) => API.delete(`/tracking/log/${id}/`),
  getWaterLog: (date) => API.get(`/tracking/water/?date=${date}`),
  updateWaterLog: (data) => API.post('/tracking/water/', data),
  getExerciseLog: (date) => API.get(`/tracking/exercise/?date=${date}`),
  addExerciseLog: (data) => API.post('/tracking/exercise/', data),
  deleteExerciseLog: (id) => API.delete(`/tracking/exercise/${id}/`),
  getWeightLog: () => API.get('/tracking/weight/'),
  addWeightLog: (data) => API.post('/tracking/weight/', data),
  getReport: (period = 'week') => API.get(`/tracking/report/?period=${period}`),
};

export const planAPI = {
  getPlans: () => API.get('/plans/'),
  generatePlan: (data) => API.post('/plans/generate/', data),
  deletePlan: (id) => API.delete(`/plans/${id}/`),
  getGroceryList: (planId) => API.get(`/plans/${planId}/grocery-list/`),
};

export const communityAPI = {
  getPosts: (category = '') => API.get(`/community/posts/${category ? `?category=${category}` : ''}`),
  createPost: (data) => API.post('/community/posts/', data),
  likePost: (id) => API.post(`/community/posts/${id}/like/`),
  getComments: (postId) => API.get(`/community/posts/${postId}/comments/`),
  createComment: (postId, content) => API.post(`/community/posts/${postId}/comments/`, { content }),
  getDieticians: () => API.get('/community/dieticians/'),
  bookAppointment: (data) => API.post('/community/appointments/', data),
  getAppointments: () => API.get('/community/appointments/'),
};

export const aiAPI = {
  chat: (message) => API.post('/calculate/ai/chat/', { message }),
  recommend: (data) => API.post('/calculate/ai/recommend/', data),
  generateRecipe: (data) => API.post('/calculate/ai/recipe/', data),
  getDeficiency: () => API.get('/tracking/report/?period=week'), // deficiency analysis can read weekly logs
};

export default API;
