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

export async function getTotal(): Promise<number> {
  const response = await api.get('/contributions/total-amount');
  return response.data.total;
}

export async function deleteContribution(id: string) {
  const response = await api.delete(`/contributions/${id}`);
  return response.data;
}

export async function downloadContributionsPDF(year: number, month: string) {
  const response = await api.get(`/contributions/pdf/${year}/${month}`, {
    responseType: 'blob', // Important for file downloads
  });
  
  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Aakasmik-Nidhi-${year}-${month}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
}
