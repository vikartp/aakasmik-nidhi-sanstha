import api from './api';

export interface ContributionPayload {
  userId: string;
  screenshotId: string;
  amount: number;
  month: string;
  year: number;
}

export interface Contribution {
  _id: string;
  userId: string;
  verifiedBy: string;
  screenshotId?: string;
  amount: number;
  month: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export async function createContribution(payload: ContributionPayload) {
  const response = await api.post('/contributions', payload);
  return response.data;
}

export async function getContributionsByUser(
  userId: string
): Promise<Contribution[]> {
  const response = await api.get(`/contributions/${userId}`);
  return response.data;
}
