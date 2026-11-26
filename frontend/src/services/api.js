import axios from 'axios';

const tokenStorageKey = '@Organizador:token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Não foi possível completar a operação.';
    if (error.response?.status === 401 && localStorage.getItem(tokenStorageKey)) {
      localStorage.removeItem(tokenStorageKey);
      localStorage.removeItem('foco-session');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(new Error(message));
  },
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Métodos de Autenticação
export const auth = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Métodos de Tarefas
export const tasks = {
  list: async (token) => {
    if (token) localStorage.setItem(tokenStorageKey, token);
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (token, taskData) => {
    if (token) localStorage.setItem(tokenStorageKey, token);
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (token, id, taskData) => {
    if (token) localStorage.setItem(tokenStorageKey, token);
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  remove: async (token, id, permanent = false) => {
    if (token) localStorage.setItem(tokenStorageKey, token);
    const response = await api.delete(`/tasks/${id}${permanent ? '?permanent=true' : ''}`);
    return response.data;
  },
};

export default api;