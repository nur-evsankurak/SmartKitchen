import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auth API
export const authAPI = {
  requestMagicLink: async (email, fullName) => {
    const response = await api.post('/auth/magic-link', {
      email,
      full_name: fullName,
    });
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Ingredients API
export const ingredientsAPI = {
  getAll: async () => {
    const response = await api.get('/ingredients');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
  },

  create: async (ingredientData) => {
    const response = await api.post('/ingredients', ingredientData);
    return response.data;
  },

  update: async (id, ingredientData) => {
    const response = await api.put(`/ingredients/${id}`, ingredientData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/ingredients/${id}`);
    return response.data;
  },
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

export default api;
