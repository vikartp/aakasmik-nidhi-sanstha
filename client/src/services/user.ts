import api from './api';

export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function createUser(data: { name: string; email: string }) {
  const response = await api.post('/users', data);
  return response.data;
}
