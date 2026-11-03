import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Envia o token JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Organizador:token');
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
    if (token) localStorage.setItem('@Organizador:token', token);
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (token, taskData) => {
    if (token) localStorage.setItem('@Organizador:token', token);
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (token, id, taskData) => {
    if (token) localStorage.setItem('@Organizador:token', token);
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  remove: async (token, id) => {
    if (token) localStorage.setItem('@Organizador:token', token);
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api;