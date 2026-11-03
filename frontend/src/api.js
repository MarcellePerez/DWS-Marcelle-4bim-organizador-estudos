const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Não foi possível completar a operação.');
  return data;
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const tasks = {
  list: (token) => request('/tasks', { token }),
  create: (token, body) => request('/tasks', { method: 'POST', token, body: JSON.stringify(body) }),
  update: (token, id, body) => request(`/tasks/${id}`, { method: 'PATCH', token, body: JSON.stringify(body) }),
  remove: (token, id) => request(`/tasks/${id}`, { method: 'DELETE', token }),
};
