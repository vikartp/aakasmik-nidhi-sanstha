import api from './api';

export interface Sahayata {
  _id: string;
  memberId: string;
  memberName: string;
  amount: number;
  givenDate: string; // ISO date string
  description?: string;
  repaymentDate?: string; // ISO date string
  repaidAmount?: number;
  status: 'pending' | 'partial' | 'repaid';
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSahayataPayload {
  memberId: string;
  memberName: string;
  amount: number;
  givenDate: string;
  description?: string;
  repaymentDate?: string;
}

export interface UpdateSahayataPayload {
  memberId?: string;
  memberName?: string;
  amount?: number;
  givenDate?: string;
  description?: string;
  repaymentDate?: string;
  repaidAmount?: number;
  status?: 'pending' | 'partial' | 'repaid';
}

export async function getSahayataRecords(): Promise<Sahayata[]> {
  const response = await api.get<Sahayata[]>('/sahayata');
  return response.data;
}

export async function createSahayata(
  data: CreateSahayataPayload
): Promise<Sahayata> {
  const response = await api.post<Sahayata>('/sahayata', data);
  return response.data;
}

export async function updateSahayata(
  id: string,
  data: UpdateSahayataPayload
): Promise<Sahayata> {
  const response = await api.put<Sahayata>(`/sahayata/${id}`, data);
  return response.data;
}

export async function deleteSahayata(id: string): Promise<void> {
  await api.delete(`/sahayata/${id}`);
}
