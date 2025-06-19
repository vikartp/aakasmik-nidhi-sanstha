import api from './api';

export interface ContributionPayload {
  userId: string;
  screenshotId?: string;
  amount: number;
  contributionDate: Date;
}

export interface Contribution {
  _id: string;
  userId: string; // This contribution belongs to member/user ID
  amount: number; // Amount contributed
  verifiedBy: string; // Name of the admin who verified the contribution
  screenshotId?: string; // Optional screenshot ID if a screenshot is associated with the contribution
  contributionDate: string; // Date of the contributio // Date when the contribution was last updated
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

export async function getContributionsByYearAndMonth(
  year: number,
  month: string
) {
  const response = await api.get(`/contributions/year/${year}/month/${month}`);
  return response.data;
}
