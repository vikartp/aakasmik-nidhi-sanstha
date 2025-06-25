import api from './api';
import type { User } from './user';

export async function getAdminsAndSuperAdmin(): Promise<User[]> {
  const response = await api.get('/get-admins-superadmin');
  return response.data;
}
