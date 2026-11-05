const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const data = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : null;
  if (!response.ok) throw new Error(data?.error || 'Não foi possível completar a operação.');
  return data;
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const tasks = {
  list: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id, permanent = false) => {
    const response = await api.delete(`/tasks/${id}${permanent ? '?permanent=true' : ''}`);
    return response.data;
  },
  remove: async (id, permanent = false) => {
    const response = await api.delete(`/tasks/${id}${permanent ? '?permanent=true' : ''}`);
    return response.data;
  }
};