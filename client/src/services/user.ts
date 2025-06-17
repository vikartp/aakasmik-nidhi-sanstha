import api from './api';

export async function getUserById(userId: string) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export async function getMe() {
  const response = await api.get('/users/me');
  return response.data;
}

export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function getUserInfoForPublic() {
  const response = await api.get('/public/users');
  return response.data;
}

export async function createUser(data: { name: string; email: string }) {
  const response = await api.post('/users', data);
  return response.data;
}

export async function updateMembershipDate(
  userId: string,
  membershipDate: Date
) {
  const response = await api.put(`/users/membership/${userId}`, {
    membershipDate: membershipDate.toISOString(),
  });
  return response.data;
}

export async function deleteUser(userId: string) {
  const response = await api.delete(`/users/${userId}`);
  if (!response.status || response.status !== 200) {
    console.error('Error deleting user:', response);
    throw new Error('Failed to delete user');
  }
  return response.data;
}
